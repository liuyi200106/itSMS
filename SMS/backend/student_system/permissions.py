from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    """Base permission for checking a user's role."""

    allowed_roles: tuple[str, ...] = ()
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "role", None) in self.allowed_roles)


class IsAdminRole(RolePermission):
    allowed_roles = ("admin",)
    message = "Only admins can perform this action."


class IsTeacherRole(RolePermission):
    allowed_roles = ("teacher",)
    message = "Only teachers can perform this action."


class IsStudentRole(RolePermission):
    allowed_roles = ("student",)
    message = "Only students can perform this action."


class IsTeacherOrAdmin(RolePermission):
    allowed_roles = ("teacher", "admin")
    message = "Only teachers or admins can perform this action."
