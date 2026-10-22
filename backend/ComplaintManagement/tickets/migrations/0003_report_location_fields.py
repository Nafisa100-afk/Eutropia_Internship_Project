from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tickets", "0002_guest_reporting"),
    ]

    operations = [
        migrations.AddField(
            model_name="ticket",
            name="category",
            field=models.CharField(
                choices=[
                    ("roads", "Roads & footpaths"),
                    ("drainage", "Drainage & water"),
                    ("waste", "Waste management"),
                    ("lighting", "Street lighting"),
                    ("other", "Other"),
                ],
                default="other",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="ticket",
            name="location",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="ticket",
            name="road",
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name="ticket",
            name="ward",
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name="ticket",
            name="incident_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
