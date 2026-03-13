from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from courses.models import Course, Enrollment
from student_system.mixins import ActionPermissionMixin, RoleOwnershipMixin
from student_system.permissions import IsTeacherOrAdmin

from .models import Announcement
from .serializers import AnnouncementSerializer


class AnnouncementViewSet(ActionPermissionMixin, RoleOwnershipMixin, viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]
    action_permission_classes = {
        "create": [IsTeacherOrAdmin],
        "update": [IsTeacherOrAdmin],
        "partial_update": [IsTeacherOrAdmin],
        "destroy": [IsTeacherOrAdmin],
    }

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Announcement.objects.none()
        if user.role == "student":
            enrolled_course_ids = Enrollment.objects.filter(student=user, status="active").values_list("course_id", flat=True)
            return Announcement.objects.filter(course_id__in=enrolled_course_ids, is_active=True)
        if user.role == "teacher":
            return Announcement.objects.filter(course__teacher=user)
        return Announcement.objects.filter(is_active=True)

    def perform_create(self, serializer):
        course_id = self.request.data.get("course")
        if self.request.user.role == "teacher" and not Course.objects.filter(id=course_id, teacher=self.request.user).exists():
            raise PermissionDenied("You can only create announcements for your own courses.")
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        self.ensure_teacher_owns(self.request, serializer.instance, "course.teacher")
        serializer.save()

    def perform_destroy(self, instance):
        self.ensure_teacher_owns(self.request, instance, "course.teacher")
        instance.delete()

    @action(detail=False, methods=["get"])
    def course_announcements(self, request):
        course_id = request.query_params.get("course_id")
        if not course_id:
            return Response({"error": "Please provide course_id"}, status=400)
        announcements = self.get_queryset().filter(course_id=course_id)
        return Response(AnnouncementSerializer(announcements, many=True).data)
