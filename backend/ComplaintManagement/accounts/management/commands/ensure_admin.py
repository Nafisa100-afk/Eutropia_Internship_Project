import os

from django.core.management.base import BaseCommand

from accounts.models import User


class Command(BaseCommand):
    help = "Create an admin user from ADMIN_USERNAME / ADMIN_PASSWORD env vars (if missing)."

    def handle(self, *args, **options):
        username = os.environ.get("ADMIN_USERNAME")
        password = os.environ.get("ADMIN_PASSWORD")
        if not username or not password:
            self.stdout.write("ADMIN_USERNAME/ADMIN_PASSWORD not set, skipping.")
            return
        if User.objects.filter(username=username).exists():
            self.stdout.write("Admin already exists.")
            return
        User.objects.create_user(
            username=username,
            password=password,
            email=os.environ.get("ADMIN_EMAIL", ""),
            role="admin",
            is_staff=True,
            is_superuser=True,
        )
        self.stdout.write(self.style.SUCCESS(f"Admin '{username}' created."))
