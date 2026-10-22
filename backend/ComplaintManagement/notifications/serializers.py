from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(
        source="recipient.username",
        read_only=True,
    )

    ticket_subject = serializers.CharField(
        source="ticket.subject",
        read_only=True,
    )

    class Meta:
        model = Notification

        fields = [
            "id",
            "recipient",
            "recipient_name",
            "ticket",
            "ticket_subject",
            "notification_type",
            "message",
            "is_read",
            "created_at",
        ]

        read_only_fields = fields
