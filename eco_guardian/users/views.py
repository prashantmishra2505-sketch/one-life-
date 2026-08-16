from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user).data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user).data,
            "token": token.key
        }, status=status.HTTP_200_OK)

from .models import User

class PendingOfficersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(role='officer', verified=False)

class ApproveOfficerView(generics.UpdateAPIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk, *args, **kwargs):
        try:
            user = User.objects.get(pk=pk, role='officer')
            user.verified = True
            user.save()
            return Response({"status": "approved", "user_id": user.id}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Officer not found"}, status=status.HTTP_404_NOT_FOUND)

class RejectOfficerView(generics.DestroyAPIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk, *args, **kwargs):
        try:
            user = User.objects.get(pk=pk, role='officer', verified=False)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"error": "Officer not found"}, status=status.HTTP_404_NOT_FOUND)
