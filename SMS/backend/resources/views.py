from django.http import FileResponse
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from courses.models import Course, Enrollment
from student_system.mixins import ActionPermissionMixin, RoleOwnershipMixin
from student_system.permissions import IsTeacherOrAdmin

from .models import CourseResource
from .serializers import CourseResourceSerializer


class CourseResourceViewSet(ActionPermissionMixin, RoleOwnershipMixin, viewsets.ModelViewSet):
    queryset = CourseResource.objects.all()
    serializer_class = CourseResourceSerializer
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
            return CourseResource.objects.none()
        if user.role == "student":
            enrolled_course_ids = Enrollment.objects.filter(student=user, status="active").values_list("course_id", flat=True)
            return CourseResource.objects.filter(course_id__in=enrolled_course_ids, is_visible=True)
        if user.role == "teacher":
            return CourseResource.objects.filter(course__teacher=user)
        return CourseResource.objects.filter(is_visible=True)

    def perform_create(self, serializer):
        course_id = self.request.data.get("course")
        if self.request.user.role == "teacher" and not Course.objects.filter(id=course_id, teacher=self.request.user).exists():
            raise PermissionDenied("You can only upload resources to your own courses.")
        uploaded_file = self.request.FILES.get("file")
        file_size = uploaded_file.size if uploaded_file else 0
        serializer.save(uploaded_by=self.request.user, file_size=file_size)

    def perform_update(self, serializer):
        self.ensure_teacher_owns(self.request, serializer.instance, "course.teacher")
        serializer.save()

    def perform_destroy(self, instance):
        self.ensure_teacher_owns(self.request, instance, "course.teacher")
        instance.delete()

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        resource = self.get_object()
        resource.download_count += 1
        resource.save(update_fields=["download_count"])
        return FileResponse(resource.file, as_attachment=True, filename=resource.file.name.split("/")[-1])

    @action(detail=False, methods=["get"])
    def course_resources(self, request):
        course_id = request.query_params.get("course_id")
        if not course_id:
            return Response({"error": "Please provide course_id"}, status=400)
        resources = self.get_queryset().filter(course_id=course_id)
        return Response(CourseResourceSerializer(resources, many=True).data)
