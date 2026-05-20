from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Address, Restaurant, Category, MenuItem, Order, OrderItem, Review

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'phone', 'avatar', 'password', 'is_available', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone', 'first_name', 'last_name']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        # admin accounts get staff/superuser flags so they can use Django admin too
        if validated_data.get('role') == 'admin':
            user.is_staff = True
            user.is_superuser = True
        user.save()
        return user


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'


class RestaurantSerializer(serializers.ModelSerializer):
    menu_items = MenuItemSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = '__all__'
        read_only_fields = ['owner', 'created_at', 'rating']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
            'description': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
            'image': {'required': False, 'allow_null': True},
        }


class RestaurantListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'slug', 'cuisine', 'image', 'rating',
                  'delivery_time', 'delivery_fee', 'is_open']


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'name', 'price', 'quantity', 'line_total']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'customer_name', 'restaurant', 'restaurant_name',
                  'driver', 'address', 'subtotal', 'delivery_fee', 'tax', 'total',
                  'status', 'payment_method', 'payment_paid', 'payment_receipt', 'notes',
                  'items', 'created_at', 'updated_at']
        read_only_fields = ['customer', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item in items_data:
            OrderItem.objects.create(order=order, **item)
        return order


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'customer', 'customer_name', 'restaurant', 'order',
                  'rating', 'comment', 'created_at']
        read_only_fields = ['customer', 'created_at']
