import os

from django.core.management.base import BaseCommand

from accounts.models import User

# (env prefix, role, django admin site access)
ACCOUNTS = [
    ("ADMIN", "admin", True),
    ("MAYOR", "mayor", False),
    ("AGENT", "agent", False),
]


class Command(BaseCommand):
    help = (
        "Create admin / mayor / agent users from env vars "
        "(ADMIN_USERNAME + ADMIN_PASSWORD, MAYOR_..., AGENT_...) if missing."
    )

    def handle(self, *args, **options):
        for prefix, role, is_admin in ACCOUNTS:
            username = os.environ.get(f"{prefix}_USERNAME")
            password = os.environ.get(f"{prefix}_PASSWORD")
            if not username or not password:
                self.stdout.write(f"{prefix}_USERNAME/{prefix}_PASSWORD not set, skipping {role}.")
                continue
            if User.objects.filter(username=username).exists():
                self.stdout.write(f"{role.capitalize()} '{username}' already exists.")
                continue
            User.objects.create_user(
                username=username,
                password=password,
                email=os.environ.get(f"{prefix}_EMAIL", ""),
                role=role,
                is_staff=is_admin,
                is_superuser=is_admin,
            )
            self.stdout.write(self.style.SUCCESS(f"{role.capitalize()} '{username}' created."))
