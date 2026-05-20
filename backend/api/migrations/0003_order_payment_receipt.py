from django.db import migrations


class Migration(migrations.Migration):
    """
    No-op. The fields it previously added were merged into 0002.
    Kept so existing databases that already ran 0003 don't break.
    """

    dependencies = [
        ('api', '0002_user_is_available'),
    ]

    operations = []
