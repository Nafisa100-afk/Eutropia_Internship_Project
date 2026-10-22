from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("logs", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="activitylog",
            name="action",
            field=models.CharField(
                choices=[
                    ("ticket_created", "Ticket Created"),
                    ("ticket_assigned", "Ticket Assigned"),
                    ("status_changed", "Status Changed"),
                    ("priority_changed", "Priority Changed"),
                    ("ticket_resolved", "Ticket Resolved"),
                    ("details_updated", "Details Updated"),
                ],
                max_length=30,
            ),
        ),
    ]
