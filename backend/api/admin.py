from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Address, Restaurant, Category, MenuItem, Order, OrderItem, Review

admin.site.register(User, UserAdmin)
admin.site.register(Address)
admin.site.register(Restaurant)
admin.site.register(Category)
admin.site.register(MenuItem)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'restaurant', 'status', 'total', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    inlines = [OrderItemInline]


admin.site.register(Review)
