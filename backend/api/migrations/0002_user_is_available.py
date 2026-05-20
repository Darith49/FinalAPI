from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Adds:
      - api_user.is_available  (driver availability toggle)
      - api_order.payment_receipt  (KHQR e-wallet receipt image)
    """

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_available',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_receipt',
            field=models.ImageField(blank=True, null=True, upload_to='receipts/'),
        ),
    ]
