from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        logs = ActivityLog.objects.select_related("ticket", "actor")

        if user.role in ("admin", "mayor"):
            pass
        elif user.role == "agent":
            logs = logs.filter(ticket__assigned_agent=user)
        elif user.role == "customer":
            logs = logs.filter(ticket__customer=user)
        else:
            logs = logs.none()

        return logs.order_by("-created_at")
