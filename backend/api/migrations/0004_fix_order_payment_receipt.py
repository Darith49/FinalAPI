from django.db import migrations, models


class Migration(migrations.Migration):
    """
    Adds api_order.payment_receipt which was missed because 0002 was already
    recorded in the database before it was updated to include this field.
    """

    dependencies = [
        ('api', '0003_order_payment_receipt'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_receipt',
            field=models.ImageField(blank=True, null=True, upload_to='receipts/'),
        ),
    ]
