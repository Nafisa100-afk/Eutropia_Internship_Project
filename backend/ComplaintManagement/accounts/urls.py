from django.urls import path

from .views import CustomerRegistrationView, MeView


urlpatterns = [
    path(
        "register/",
        CustomerRegistrationView.as_view(),
        name="customer-register",
    ),
    path("me/", MeView.as_view(), name="me"),
]
