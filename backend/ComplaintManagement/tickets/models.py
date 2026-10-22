from django.conf import settings
from django.db import models


class Ticket(models.Model):

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    STATUS_CHOICES = [
        ("open", "Open"),
        ("assigned", "Assigned"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]

    CATEGORY_CHOICES = [
        ("roads", "Roads & footpaths"),
        ("drainage", "Drainage & water"),
        ("waste", "Waste management"),
        ("lighting", "Street lighting"),
        ("other", "Other"),
    ]

    # Guest (sign up chhara) report e customer null thake.
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="submitted_tickets",
        null=True,
        blank=True,
    )

    # Guest reporter er optional contact info + tracking code
    guest_name = models.CharField(max_length=100, blank=True)
    guest_email = models.EmailField(blank=True)
    guest_phone = models.CharField(max_length=30, blank=True)
    tracking_code = models.CharField(
        max_length=12,
        unique=True,
        null=True,
        blank=True,
    )

    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets"
    )

    subject = models.CharField(max_length=255)

    description = models.TextField()

    # Report er jaigar details. Purono ticket gulor jonno blank thakte pare.
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="other"
    )

    location = models.CharField(max_length=255, blank=True)

    road = models.CharField(max_length=150, blank=True)

    ward = models.CharField(max_length=50, blank=True)

    # Shomossha kon dine hoyechhe / dekha gechhe (created_at holo report dewar shomoy).
    incident_date = models.DateField(null=True, blank=True)

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default="medium"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="open"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    resolved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    @property
    def is_guest(self):
        return self.customer_id is None

    def __str__(self):
        return self.subject