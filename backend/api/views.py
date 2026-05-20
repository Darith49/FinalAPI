from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Sum, Avg, Q
from django.utils.text import slugify

from .models import Address, Restaurant, Category, MenuItem, Order, OrderItem, Review
from .serializers import (
    UserSerializer, RegisterSerializer, AddressSerializer,
    RestaurantSerializer, RestaurantListSerializer,
    CategorySerializer, MenuItemSerializer,
    OrderSerializer, ReviewSerializer,
)

User = get_user_model()


# ------------- AUTH -------------
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def me(request):
    if not request.user or not request.user.is_authenticated:
        return Response({'detail': 'Not signed in.'}, status=401)
    return Response(UserSerializer(request.user).data)


# ------------- USERS -------------
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']

    def get_queryset(self):
        qs = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        return qs


# ------------- ADDRESSES -------------
class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Address.objects.filter(user=self.request.user)
        return Address.objects.none()

    def perform_create(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()


# ------------- RESTAURANTS -------------
class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.filter(is_active=True)
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'cuisine', 'description']
    ordering_fields = ['rating', 'delivery_time', 'created_at']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return RestaurantListSerializer
        return RestaurantSerializer

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', '')
        slug = serializer.validated_data.get('slug') or slugify(name)
        base, i = slug, 2
        while Restaurant.objects.filter(slug=slug).exists():
            slug = f"{base}-{i}"
            i += 1
        owner = self.request.user if (self.request.user and self.request.user.is_authenticated) else None
        if owner is None:
            # fall back to first restaurant-role user, then any user
            owner = User.objects.filter(role='restaurant').first() or User.objects.first()
        serializer.save(owner=owner, slug=slug)

    @action(detail=False, methods=['get'])
    def mine(self, request):
        """Restaurants owned by the current user (or all of them when not signed in)."""
        if request.user and request.user.is_authenticated:
            qs = Restaurant.objects.filter(owner=request.user)
        else:
            qs = Restaurant.objects.all()
        # Pass request context so ImageField returns absolute URLs (fixes image disappearing after re-login)
        return Response(RestaurantSerializer(qs, many=True, context={'request': request}).data)


# ------------- CATEGORIES & MENU -------------
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_queryset(self):
        qs = MenuItem.objects.all()
        restaurant = self.request.query_params.get('restaurant')
        if restaurant:
            if str(restaurant).isdigit():
                qs = qs.filter(restaurant_id=restaurant)
            else:
                qs = qs.filter(restaurant__slug=restaurant)
        return qs


# ------------- ORDERS -------------
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Order.objects.all()
        if user.role == 'admin' or user.is_staff:
            return Order.objects.all()
        if user.role == 'restaurant':
            return Order.objects.filter(restaurant__owner=user)
        if user.role == 'delivery':
            # drivers see jobs assigned to them PLUS the open pool
            return Order.objects.filter(Q(driver=user) | Q(driver__isnull=True))
        return Order.objects.filter(customer=user)

    def perform_create(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(customer=self.request.user)
        else:
            # token-less guest order — attach to the first customer-role user as fallback
            fallback = User.objects.filter(role='customer').first() or User.objects.first()
            serializer.save(customer=fallback)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'detail': 'Invalid status value.'}, status=400)
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)

    # --------- DELIVERY: open pool ---------
    @action(detail=False, methods=['get'])
    def available(self, request):
        """All unclaimed orders — anyone with a delivery account (or anonymous) can browse."""
        qs = Order.objects.filter(
            driver__isnull=True,
            status__in=['pending', 'confirmed', 'preparing', 'ready'],
        ).order_by('-created_at')
        return Response(OrderSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Driver claims an unassigned order (first-come-first-served)."""
        driver = request.user if (request.user and request.user.is_authenticated) else None
        if driver is None:
            driver = User.objects.filter(role='delivery').first()
            if driver is None:
                return Response({'detail': 'No delivery driver account exists yet.'}, status=400)
        updated = Order.objects.filter(pk=pk, driver__isnull=True).update(
            driver=driver, status='out_for_delivery'
        )
        if not updated:
            return Response({'detail': 'This order has already been accepted by another driver.'}, status=409)
        order = Order.objects.get(pk=pk)
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_receipt(self, request, pk=None):
        """Customer uploads a KHQR payment receipt image for an e-wallet order."""
        order = self.get_object()
        receipt = request.FILES.get('payment_receipt')
        if not receipt:
            return Response({'detail': 'No file provided.'}, status=400)
        order.payment_receipt = receipt
        order.save(update_fields=['payment_receipt'])
        return Response(OrderSerializer(order, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def assign_driver(self, request, pk=None):
        order = self.get_object()
        driver_id = request.data.get('driver_id')
        try:
            driver = User.objects.get(id=driver_id, role='delivery')
        except User.DoesNotExist:
            return Response({'detail': 'Driver not found.'}, status=404)
        order.driver = driver
        order.save()
        return Response(OrderSerializer(order).data)


# ------------- REVIEWS -------------
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Review.objects.all()
        restaurant = self.request.query_params.get('restaurant')
        if restaurant:
            qs = qs.filter(restaurant_id=restaurant)
        return qs

    def perform_create(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            review = serializer.save(customer=self.request.user)
        else:
            fallback = User.objects.first()
            review = serializer.save(customer=fallback)
        # Recalculate and update the restaurant average rating
        restaurant = review.restaurant
        avg = Review.objects.filter(restaurant=restaurant).aggregate(a=Avg('rating'))['a'] or 0
        Restaurant.objects.filter(pk=restaurant.pk).update(rating=round(avg, 2))


# ------------- REPORTS -------------
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def reports_summary(request):
    qs = Order.objects.filter(status='delivered')
    return Response({
        'total_orders': Order.objects.count(),
        'delivered_orders': qs.count(),
        'total_revenue': qs.aggregate(s=Sum('total'))['s'] or 0,
        'pending': Order.objects.filter(status='pending').count(),
        'restaurants': Restaurant.objects.count(),
        'customers': User.objects.filter(role='customer').count(),
        'avg_rating': Review.objects.aggregate(a=Avg('rating'))['a'] or 0,
    })