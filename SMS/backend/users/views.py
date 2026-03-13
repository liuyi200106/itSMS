from django.contrib.auth import get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.response import Response

from student_system.mixins import ActionPermissionMixin
from student_system.permissions import IsAdminRole, IsTeacherOrAdmin

from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    UserCreateSerializer,
    UserSerializer,
)

User = get_user_model()


class UserViewSet(ActionPermissionMixin, viewsets.ModelViewSet):
    """User ViewSet with role-aware permissions."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    action_permission_classes = {
        "login": [permissions.AllowAny],
        "register": [permissions.AllowAny],
        "list": [IsAdminRole],
        "create": [IsAdminRole],
        "update": [IsAdminRole],
        "partial_update": [IsAdminRole],
        "destroy": [IsAdminRole],
        "teachers": [IsAdminRole],
        "students": [IsTeacherOrAdmin],
    }

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()
        if user.role == "admin":
            return User.objects.all()
        return User.objects.filter(id=user.id)

    def get_serializer_class(self):
        if self.action in ["create", "register"]:
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=["post"])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data})

    @action(detail=False, methods=["post"])
    def logout(self, request):
        if request.user.is_authenticated:
            Token.objects.filter(user=request.user).delete()
        return Response({"message": "Logged out successfully"})

    @action(detail=False, methods=["post"])
    def register(self, request):
        payload = request.data.copy()
        if not request.user.is_authenticated or getattr(request.user, "role", None) != "admin":
            payload["role"] = "student"
            payload.pop("employee_id", None)

        serializer = UserCreateSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = Token.objects.create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def me(self, request):
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=["post"])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        Token.objects.filter(user=request.user).delete()
        token = Token.objects.create(user=request.user)
        return Response({"message": "Password changed successfully", "token": token.key})

    @action(detail=False, methods=["get"])
    def students(self, request):
        students = User.objects.filter(role="student")
        return Response(UserSerializer(students, many=True).data)

    @action(detail=False, methods=["get"])
    def teachers(self, request):
        teachers = User.objects.filter(role="teacher")
        return Response(UserSerializer(teachers, many=True).data)
