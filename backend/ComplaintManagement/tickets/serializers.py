
from datetime import timedelta

from django.utils import timezone

from rest_framework import serializers

from .models import Ticket

CATEGORY_VALUES = [c[0] for c in Ticket.CATEGORY_CHOICES]


def validate_not_future(value):
    """Shomossha-r tarikh bhobishyot hote pare na (timezone er jonno 1 din tolerance)."""
    if value and value > timezone.localdate() + timedelta(days=1):
        raise serializers.ValidationError("The date cannot be in the future.")
    return value


class TicketSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()

    is_guest = serializers.BooleanField(read_only=True)

    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True,
    )

    assigned_agent_name = serializers.CharField(
        source="assigned_agent.username",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Ticket

        fields = [
            "id",
            "customer",
            "customer_name",
            "is_guest",
            "guest_email",
            "guest_phone",
            "assigned_agent",
            "assigned_agent_name",
            "subject",
            "description",
            "category",
            "category_display",
            "location",
            "road",
            "ward",
            "incident_date",
            "priority",
            "status",
            "created_at",
            "updated_at",
            "resolved_at",
        ]

        read_only_fields = [
            "id",
            "customer",
            "customer_name",
            "is_guest",
            "guest_email",
            "guest_phone",
            "assigned_agent",
            "assigned_agent_name",
            "category_display",
            "status",
            "created_at",
            "updated_at",
            "resolved_at",
        ]

    def validate_incident_date(self, value):
        return validate_not_future(value)

    def validate(self, attrs):
        # Notun ticket e location ar ward lagbei (update e lagbe na).
        if self.instance is None:
            for field, label in (("location", "Location"), ("ward", "Ward")):
                if not (attrs.get(field) or "").strip():
                    raise serializers.ValidationError(
                        {field: f"{label} is required."}
                    )
        return attrs

    def get_customer_name(self, obj):
        if obj.customer_id:
            return obj.customer.username
        return obj.guest_name or "Guest"


class GuestTicketCreateSerializer(serializers.Serializer):
    """Sign up chhara report korar input. Shudhu ei field gulo accept hoy."""

    subject = serializers.CharField(min_length=5, max_length=255)
    description = serializers.CharField(min_length=20, max_length=5000)
    priority = serializers.ChoiceField(
        choices=[c[0] for c in Ticket.PRIORITY_CHOICES],
        default="medium",
    )
    category = serializers.ChoiceField(choices=CATEGORY_VALUES, default="other")
    location = serializers.CharField(min_length=3, max_length=255)
    road = serializers.CharField(
        max_length=150, required=False, allow_blank=True, default=""
    )
    ward = serializers.CharField(max_length=50)
    incident_date = serializers.DateField(
        required=False,
        allow_null=True,
        default=None,
        validators=[validate_not_future],
    )
    guest_name = serializers.CharField(
        max_length=100, required=False, allow_blank=True, default=""
    )
    guest_email = serializers.EmailField(
        required=False, allow_blank=True, default=""
    )
    guest_phone = serializers.CharField(
        max_length=30, required=False, allow_blank=True, default=""
    )
    # Honeypot: manush dekhte pay na, bot ra fill kore. Fill hole ignore kori.
    website = serializers.CharField(
        required=False, allow_blank=True, default=""
    )


class GuestTrackSerializer(serializers.Serializer):
    ticket_id = serializers.IntegerField(min_value=1)
    tracking_code = serializers.CharField(max_length=12)


class TicketDetailsSerializer(serializers.ModelSerializer):
    """Agent / admin report er jaigar details thik korar jonno (partial update)."""

    class Meta:
        model = Ticket
        fields = ["category", "location", "road", "ward", "incident_date"]

    def validate_location(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Location is required.")
        return value

    def validate_ward(self, value):
        if not value.strip():
            raise serializers.ValidationError("Ward is required.")
        return value

    def validate_incident_date(self, value):
        return validate_not_future(value)


class PublicTicketSerializer(serializers.ModelSerializer):
    """Homepage / public list er jonno. Reporter er naam, email, phone, agent kichu dei na.

    Description chhoto kore dei, jate keu bhul kore personal info likhle shob public na hoy.
    """

    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )
    description = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id",
            "subject",
            "description",
            "category",
            "category_display",
            "location",
            "road",
            "ward",
            "incident_date",
            "priority",
            "status",
            "created_at",
            "resolved_at",
        ]
        read_only_fields = fields

    def get_description(self, obj):
        text = (obj.description or "").strip()
        return text if len(text) <= 200 else text[:200].rstrip() + "…"
