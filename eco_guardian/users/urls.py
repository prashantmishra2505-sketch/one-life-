from django.urls import path
from .views import RegisterView, LoginView, PendingOfficersView, ApproveOfficerView, RejectOfficerView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('officers/pending/', PendingOfficersView.as_view(), name='pending-officers'),
    path('officers/<int:pk>/approve/', ApproveOfficerView.as_view(), name='approve-officer'),
    path('officers/<int:pk>/reject/', RejectOfficerView.as_view(), name='reject-officer'),
]
