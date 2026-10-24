
import secrets
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.models import User
from logs.models import ActivityLog
from notifications.email_service import send_ticket_email
from notifications.models import Notification
from sla.models import SLA

from .models import Ticket
from .serializers import (
    CATEGORY_VALUES,
    GuestTicketCreateSerializer,
    GuestTrackSerializer,
    PublicTicketSerializer,
    TicketDetailsSerializer,
    TicketSerializer,
)
from .throttles import GuestSubmitThrottle, GuestTrackThrottle, PublicListThrottle

SLA_HOURS = {"low": 72, "medium": 48, "high": 24, "urgent": 8}

ALL_STATUSES = ["open", "assigned", "in_progress", "resolved", "closed"]
# ?status=done / ?status=active moto shortcut
STATUS_ALIASES = {
    "done": ["resolved", "closed"],
    "active": ["open", "assigned", "in_progress"],
}

# 0/O, 1/I confuse korte pare, tai bad
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_tracking_code():
    while True:
        code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(8))
        if not Ticket.objects.filter(tracking_code=code).exists():
            return code


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "customer":
            return Ticket.objects.filter(customer=user)

        if user.role == "agent":
            return Ticket.objects.filter(assigned_agent=user)

        # Mayor shob ticket dekhte pare, kintu kichu bodlate pare na.
        if user.role in ("admin", "mayor"):
            return Ticket.objects.all()

        return Ticket.objects.none()

    def create_notification(
        self, recipient, ticket, notification_type, message
    ):
        Notification.objects.create(
            recipient=recipient,
            ticket=ticket,
            notification_type=notification_type,
            message=message,
        )

        # Send an email if the recipient has an email address.
        # The email helper catches sending errors, so an email failure
        # will not interrupt the ticket operation.
        if recipient.email:
            send_ticket_email(
                recipient_email=recipient.email,
                subject=f"Complaint Management: Ticket #{ticket.id}",
                message=message,
            )

    def notify_guest(self, ticket, message):
        """Guest reporter email dile tader email e update pathay."""
        if ticket.customer_id is None and ticket.guest_email:
            send_ticket_email(
                recipient_email=ticket.guest_email,
                subject=f"Complaint Management: Ticket #{ticket.id}",
                message=message,
            )

    def create_activity_log(self, ticket, actor, action, description):
        ActivityLog.objects.create(
            ticket=ticket,
            actor=actor,
            action=action,
            description=description,
        )

    def update(self, request, *args, **kwargs):
        # partial_update-o eta-i call kore. Mayor read-only.
        if request.user.role == "mayor":
            return Response(
                {"detail": "The mayor has view-only access."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role == "mayor":
            return Response(
                {"detail": "The mayor has view-only access."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        if request.user.role != "customer":
            return Response(
                {"detail": "Only customers can submit tickets."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        sla_hours = {
            "low": 72,
            "medium": 48,
            "high": 24,
            "urgent": 8,
        }

        with transaction.atomic():
            ticket = serializer.save(customer=self.request.user)

            started_at = timezone.now()

            SLA.objects.create(
                ticket=ticket,
                started_at=started_at,
                deadline=started_at + timedelta(
                    hours=sla_hours[ticket.priority]
                ),
            )

            message = (
                f"Your complaint ticket #{ticket.id} "
                f"has been created successfully."
            )

            self.create_notification(
                recipient=ticket.customer,
                ticket=ticket,
                notification_type="ticket_created",
                message=message,
            )

            self.create_activity_log(
                ticket=ticket,
                actor=self.request.user,
                action="ticket_created",
                description=f"Ticket #{ticket.id} was created.",
            )

    @action(detail=False, methods=["get"])
    def queue(self, request):
        user = request.user

        if user.role == "agent":
            tickets = Ticket.objects.filter(
                assigned_agent=user,
                status__in=["open", "assigned", "in_progress"],
            )
        elif user.role in ("admin", "mayor"):
            tickets = Ticket.objects.filter(
                status__in=["open", "assigned", "in_progress"],
            )
        else:
            return Response(
                {"detail": "Only agents, admins and the mayor can access the queue."},
                status=status.HTTP_403_FORBIDDEN,
            )

        tickets = tickets.order_by("-created_at")

        return Response(
            self.get_serializer(tickets, many=True).data
        )

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        ticket = self.get_object()

        if request.user.role not in ["agent", "admin"]:
            return Response(
                {"detail": "Only agents and admins can update status."},
                status=status.HTTP_403_FORBIDDEN,
            )

        new_status = request.data.get("status")
        valid_statuses = [
            "open", "assigned", "in_progress", "resolved", "closed"
        ]

        if new_status not in valid_statuses:
            return Response(
                {"detail": "Invalid status."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = ticket.status

        if old_status == new_status:
            return Response(TicketSerializer(ticket).data)

        with transaction.atomic():
            now = timezone.now()
            ticket.status = new_status

            if new_status == "resolved":
                ticket.resolved_at = now
            elif old_status == "resolved":
                ticket.resolved_at = None

            ticket.save()

            try:
                sla = ticket.sla

                if new_status == "resolved":
                    sla.completed_at = now
                    sla.is_breached = now > sla.deadline
                elif old_status == "resolved":
                    sla.completed_at = None
                    sla.is_breached = now > sla.deadline

                sla.save(
                    update_fields=["completed_at", "is_breached"]
                )
            except SLA.DoesNotExist:
                pass

            notification_type = (
                "ticket_resolved"
                if new_status == "resolved"
                else "status_changed"
            )

            message = (
                f"Ticket #{ticket.id} status changed "
                f"from {old_status} to {new_status}."
            )

            # Guest ticket e customer thake na, tai None bad dei.
            recipients = [
                r for r in (ticket.customer, ticket.assigned_agent) if r
            ]

            # Avoid sending duplicate notifications to the same user.
            unique_recipients = {
                recipient.id: recipient for recipient in recipients
            }

            for recipient in unique_recipients.values():
                self.create_notification(
                    recipient=recipient,
                    ticket=ticket,
                    notification_type=notification_type,
                    message=message,
                )

            self.notify_guest(ticket, message)

            self.create_activity_log(
                ticket=ticket,
                actor=request.user,
                action=notification_type,
                description=message,
            )

        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=["patch"])
    def update_priority(self, request, pk=None):
        ticket = self.get_object()

        if request.user.role not in ["agent", "admin"]:
            return Response(
                {"detail": "Only agents and admins can update priority."},
                status=status.HTTP_403_FORBIDDEN,
            )

        new_priority = request.data.get("priority")
        valid_priorities = ["low", "medium", "high", "urgent"]

        if new_priority not in valid_priorities:
            return Response(
                {"detail": "Invalid priority."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_priority = ticket.priority

        if old_priority == new_priority:
            return Response(TicketSerializer(ticket).data)

        with transaction.atomic():
            ticket.priority = new_priority
            ticket.save(update_fields=["priority", "updated_at"])

            message = (
                f"Ticket #{ticket.id} priority changed "
                f"from {old_priority} to {new_priority}."
            )

            # Guest ticket e customer thake na, tai None bad dei.
            recipients = [
                r for r in (ticket.customer, ticket.assigned_agent) if r
            ]

            unique_recipients = {
                recipient.id: recipient for recipient in recipients
            }

            for recipient in unique_recipients.values():
                self.create_notification(
                    recipient=recipient,
                    ticket=ticket,
                    notification_type="priority_changed",
                    message=message,
                )

            self.notify_guest(ticket, message)

            self.create_activity_log(
                ticket=ticket,
                actor=request.user,
                action="priority_changed",
                description=message,
            )

        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=["patch"])
    def update_details(self, request, pk=None):
        """Agent / admin report er category, location, road, ward, date thik kore."""
        ticket = self.get_object()

        if request.user.role not in ["agent", "admin"]:
            return Response(
                {"detail": "Only agents and admins can update ticket details."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TicketDetailsSerializer(
            ticket, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)

        changed = [
            name
            for name, value in serializer.validated_data.items()
            if getattr(ticket, name) != value
        ]

        if not changed:
            return Response(TicketSerializer(ticket).data)

        with transaction.atomic():
            ticket = serializer.save()

            self.create_activity_log(
                ticket=ticket,
                actor=request.user,
                action="details_updated",
                description=(
                    f"Ticket #{ticket.id} details updated: "
                    f"{', '.join(changed)}."
                ),
            )

        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=["patch"])
    def assign_agent(self, request, pk=None):
        ticket = self.get_object()

        if request.user.role != "admin":
            return Response(
                {"detail": "Only admins can assign tickets."},
                status=status.HTTP_403_FORBIDDEN,
            )

        agent_id = request.data.get("agent_id")

        if not agent_id:
            return Response(
                {"detail": "agent_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            agent = User.objects.get(
                id=agent_id,
                role="agent",
            )
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {"detail": "Valid support agent not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        old_agent = ticket.assigned_agent
        old_status = ticket.status

        if old_agent and old_agent.id == agent.id:
            return Response(TicketSerializer(ticket).data)

        with transaction.atomic():
            ticket.assigned_agent = agent

            if ticket.status == "open":
                ticket.status = "assigned"

            ticket.save()

            self.create_notification(
                recipient=agent,
                ticket=ticket,
                notification_type="ticket_assigned",
                message=f"Ticket #{ticket.id} has been assigned to you.",
            )

            if old_agent:
                self.create_notification(
                    recipient=old_agent,
                    ticket=ticket,
                    notification_type="status_changed",
                    message=f"Ticket #{ticket.id} has been reassigned.",
                )

            self.create_activity_log(
                ticket=ticket,
                actor=request.user,
                action="ticket_assigned",
                description=(
                    f"Ticket #{ticket.id} was assigned to "
                    f"{agent.username}. Previous status: {old_status}."
                ),
            )

        return Response(TicketSerializer(ticket).data)

    # ------------------------------------------------------------------
    # Public report list (homepage / resolved page). Login lage na.
    # GET /api/tickets/tickets/public/?category=roads&status=done&limit=100
    # ------------------------------------------------------------------
    @action(
        detail=False,
        methods=["get"],
        url_path="public",
        permission_classes=[AllowAny],
        authentication_classes=[],
        throttle_classes=[PublicListThrottle],
    )
    def public(self, request):
        tickets = Ticket.objects.all().order_by("-created_at", "-id")

        category = request.query_params.get("category", "").strip()
        if category:
            if category not in CATEGORY_VALUES:
                return Response(
                    {"detail": "Unknown category."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            tickets = tickets.filter(category=category)

        status_param = request.query_params.get("status", "").strip().lower()
        if status_param:
            wanted = []
            for part in status_param.split(","):
                part = part.strip()
                wanted += STATUS_ALIASES.get(part, [part])
            if any(s not in ALL_STATUSES for s in wanted):
                return Response(
                    {"detail": "Unknown status."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            tickets = tickets.filter(status__in=wanted)

        try:
            limit = int(request.query_params.get("limit", 100))
        except (TypeError, ValueError):
            limit = 100
        limit = max(1, min(limit, 200))

        return Response(PublicTicketSerializer(tickets[:limit], many=True).data)

    # ------------------------------------------------------------------
    # Sign up chhara (guest) report ar track
    # ------------------------------------------------------------------
    @action(
        detail=False,
        methods=["post"],
        url_path="guest",
        permission_classes=[AllowAny],
        authentication_classes=[],
        throttle_classes=[GuestSubmitThrottle],
    )
    def guest_create(self, request):
        serializer = GuestTicketCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Honeypot filled hole bot, kichu save na kore fake success dei.
        if data.get("website"):
            return Response(
                {"id": 0, "tracking_code": "XXXXXXXX"},
                status=status.HTTP_201_CREATED,
            )

        with transaction.atomic():
            ticket = Ticket.objects.create(
                customer=None,
                subject=data["subject"],
                description=data["description"],
                category=data["category"],
                location=data["location"],
                road=data["road"],
                ward=data["ward"],
                incident_date=data["incident_date"],
                priority=data["priority"],
                guest_name=data["guest_name"],
                guest_email=data["guest_email"],
                guest_phone=data["guest_phone"],
                tracking_code=generate_tracking_code(),
            )

            started_at = timezone.now()
            sla = SLA.objects.create(
                ticket=ticket,
                started_at=started_at,
                deadline=started_at
                + timedelta(hours=SLA_HOURS[ticket.priority]),
            )

            self.create_activity_log(
                ticket=ticket,
                actor=None,
                action="ticket_created",
                description=f"Ticket #{ticket.id} was created by a guest.",
            )

        self.notify_guest(
            ticket,
            (
                f"Your complaint ticket #{ticket.id} has been received. "
                f"Tracking code: {ticket.tracking_code}. "
                f"Use the ticket number and this code on the Track page."
            ),
        )

        return Response(
            {
                "id": ticket.id,
                "tracking_code": ticket.tracking_code,
                "subject": ticket.subject,
                "category": ticket.category,
                "priority": ticket.priority,
                "status": ticket.status,
                "created_at": ticket.created_at,
                "deadline": sla.deadline,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="guest-track",
        permission_classes=[AllowAny],
        authentication_classes=[],
        throttle_classes=[GuestTrackThrottle],
    )
    def guest_track(self, request):
        serializer = GuestTrackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        not_found = Response(
            {"detail": "No ticket matches that number and tracking code."},
            status=status.HTTP_404_NOT_FOUND,
        )

        ticket = (
            Ticket.objects.filter(
                id=serializer.validated_data["ticket_id"],
                customer__isnull=True,
            )
            .select_related("assigned_agent")
            .first()
        )
        code = serializer.validated_data["tracking_code"].strip().upper()

        if not ticket or not ticket.tracking_code:
            return not_found

        if not secrets.compare_digest(
            ticket.tracking_code.encode(), code.encode()
        ):
            return not_found

        sla = getattr(ticket, "sla", None)

        # Shudhu safe info; guest er email/phone ferot dei na.
        return Response(
            {
                "id": ticket.id,
                "subject": ticket.subject,
                "description": ticket.description,
                "category": ticket.category,
                "category_display": ticket.get_category_display(),
                "location": ticket.location,
                "road": ticket.road,
                "ward": ticket.ward,
                "incident_date": ticket.incident_date,
                "priority": ticket.priority,
                "status": ticket.status,
                "customer_name": ticket.guest_name or "Guest",
                "assigned_agent": None,
                "assigned_agent_name": (
                    ticket.assigned_agent.username
                    if ticket.assigned_agent
                    else None
                ),
                "created_at": ticket.created_at,
                "updated_at": ticket.updated_at,
                "resolved_at": ticket.resolved_at,
                "deadline": sla.deadline if sla else None,
                "is_breached": sla.is_breached if sla else False,
            }
        )
