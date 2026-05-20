from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level: only the resource owner can mutate; anyone can read."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, 'owner', None) or getattr(obj, 'user', None)
        return owner == request.user


class IsRestaurantOwnerOfMenuItem(permissions.BasePermission):
    """For MenuItem/Category: write only by the owning restaurant's owner."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.restaurant.owner_id == request.user.id
