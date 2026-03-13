from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied


class ActionPermissionMixin:
    """Allow DRF permission classes to vary by action."""

    action_permission_classes: dict[str, list[type[permissions.BasePermission]]] = {}

    def get_permissions(self):
        permission_classes = self.action_permission_classes.get(self.action)
        if permission_classes is None:
            permission_classes = getattr(self, "permission_classes", [permissions.IsAuthenticated])
        return [permission() for permission in permission_classes]


class RoleOwnershipMixin:
    """Shared helpers for role and ownership validation."""

    def ensure_role(self, request, *roles: str):
        if getattr(request.user, "role", None) not in roles:
            allowed = " or ".join(roles)
            raise PermissionDenied(f"Only {allowed} can perform this action.")

    def ensure_teacher_owns(self, request, instance, relation_path: str):
        if getattr(request.user, "role", None) != "teacher":
            return

        target = instance
        for attr in relation_path.split("."):
            target = getattr(target, attr)

        if target != request.user:
            raise PermissionDenied("You can only manage records for your own courses.")
