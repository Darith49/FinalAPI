from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views
from .auth_serializers import EmailOrUsernameTokenView
from .explorer_views import api_explorer

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')        # added basename
router.register(r'addresses', views.AddressViewSet, basename='address')
router.register(r'restaurants', views.RestaurantViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'menu-items', views.MenuItemViewSet, basename='menuitem')  # added basename
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'reviews', views.ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.register, name='register'),
    path('auth/login/', EmailOrUsernameTokenView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.me, name='me'),
    path('reports/summary/', views.reports_summary, name='reports_summary'),
    path('explorer/', api_explorer, name='api_explorer'),
]
