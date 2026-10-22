from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .serializers import CustomerRegistrationSerializer, MeSerializer


class CustomerRegistrationView(generics.CreateAPIView):
    serializer_class = CustomerRegistrationSerializer
    permission_classes = [AllowAny]


class MeView(generics.RetrieveAPIView):
    """GET /api/accounts/me/ : ami ke ar amar role ki."""

    serializer_class = MeSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
