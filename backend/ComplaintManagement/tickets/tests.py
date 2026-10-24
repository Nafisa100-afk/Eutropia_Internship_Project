from django.test import TestCase

# Create your tests here.

from rest_framework.test import APITestCase

from .models import Ticket


class PublicReportsTests(APITestCase):
    """GET /api/tickets/tickets/public/ : login chhara dekha jay, kintu private info jay na."""

    url = "/api/tickets/tickets/public/"

    def setUp(self):
        Ticket.objects.create(
            subject="Big pothole on Main Road",
            description="x" * 300,
            category="roads",
            location="Main Road",
            ward="3",
            status="open",
            guest_name="Secret Name",
            guest_email="secret@example.com",
            guest_phone="01700000000",
        )
        Ticket.objects.create(
            subject="Streetlight is out",
            description="Dark at night near the park.",
            category="lighting",
            location="City Park",
            ward="4",
            status="resolved",
        )

    def test_anonymous_can_list(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 2)

    def test_private_fields_are_not_exposed(self):
        res = self.client.get(self.url)
        for row in res.data:
            for field in (
                "guest_name",
                "guest_email",
                "guest_phone",
                "customer",
                "customer_name",
                "assigned_agent",
                "tracking_code",
            ):
                self.assertNotIn(field, row)

    def test_description_is_shortened(self):
        res = self.client.get(self.url, {"category": "roads"})
        self.assertLessEqual(len(res.data[0]["description"]), 201)

    def test_category_filter(self):
        res = self.client.get(self.url, {"category": "lighting"})
        self.assertEqual([r["category"] for r in res.data], ["lighting"])

    def test_status_done_filter(self):
        res = self.client.get(self.url, {"status": "done"})
        self.assertEqual([r["status"] for r in res.data], ["resolved"])

    def test_unknown_category_is_rejected(self):
        self.assertEqual(
            self.client.get(self.url, {"category": "nope"}).status_code, 400
        )
