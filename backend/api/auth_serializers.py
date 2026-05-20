"""Custom JWT serializer: accept EITHER username or email."""
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import serializers

User = get_user_model()


class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    username_field = "username"  # field key the client sends ("username")

    def validate(self, attrs):
        identifier = attrs.get("username") or ""
        # If it looks like an email, look up the real username first.
        if "@" in identifier:
            try:
                u = User.objects.get(email__iexact=identifier.strip())
                attrs["username"] = u.username
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {"detail": f"No account found for email {identifier}."}
                )
        return super().validate(attrs)


class EmailOrUsernameTokenView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenSerializer
