from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from student_system.mixins import ActionPermissionMixin, RoleOwnershipMixin
from student_system.permissions import IsAdminRole, IsStudentRole, IsTeacherOrAdmin, IsTeacherRole

from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer, StudentCourseSerializer


class CourseViewSet(ActionPermissionMixin, RoleOwnershipMixin, viewsets.ModelViewSet):
    """Course ViewSet with role-aware access control."""

    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    action_permission_classes = {
        "create": [IsTeacherOrAdmin],
        "update": [IsTeacherOrAdmin],
        "partial_update": [IsTeacherOrAdmin],
        "destroy": [IsTeacherOrAdmin],
        "enroll": [IsStudentRole],
        "drop": [IsStudentRole],
        "my_courses": [IsStudentRole],
        "available": [IsStudentRole],
        "students": [IsTeacherOrAdmin],
        "teaching": [IsTeacherRole],
    }

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Course.objects.filter(is_active=True)
        if user.role == "teacher":
            return Course.objects.filter(teacher=user)
        if user.role == "student":
            return Course.objects.filter(is_active=True)
        return Course.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role == "teacher":
            serializer.save(teacher=self.request.user)
            return
        serializer.save()

    def perform_update(self, serializer):
        self.ensure_teacher_owns(self.request, serializer.instance, "teacher")
        serializer.save()

    def perform_destroy(self, instance):
        self.ensure_teacher_owns(self.request, instance, "teacher")
        instance.delete()

    @action(detail=True, methods=["post"])
    def enroll(self, request, pk=None):
        course = self.get_object()
        student = request.user

        if Enrollment.objects.filter(student=student, course=course, status="active").exists():
            return Response({"error": "You have already enrolled in this course"}, status=400)
        if course.enrollments.filter(status="active").count() >= course.max_students:
            return Response({"error": "Course is full"}, status=400)

        enrollment, created = Enrollment.objects.get_or_create(student=student, course=course)
        if not created and enrollment.status != "active":
            enrollment.status = "active"
            enrollment.completed_at = None
            enrollment.save(update_fields=["status", "completed_at"])
        return Response(EnrollmentSerializer(enrollment).data, status=201)

    @action(detail=True, methods=["post"])
    def drop(self, request, pk=None):
        course = self.get_object()
        student = request.user
        try:
            enrollment = Enrollment.objects.get(student=student, course=course, status="active")
        except Enrollment.DoesNotExist:
            return Response({"error": "You have not enrolled in this course"}, status=400)

        enrollment.status = "dropped"
        enrollment.completed_at = None
        enrollment.save(update_fields=["status", "completed_at"])
        return Response({"message": "Course dropped successfully"})

    @action(detail=False, methods=["get"])
    def my_courses(self, request):
        enrollments = Enrollment.objects.filter(student=request.user, status="active").select_related("course")
        courses = [enrollment.course for enrollment in enrollments]
        serializer = StudentCourseSerializer(courses, many=True, context={"student": request.user})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def available(self, request):
        enrolled_course_ids = Enrollment.objects.filter(student=request.user, status="active").values_list("course_id", flat=True)
        courses = Course.objects.filter(is_active=True).exclude(id__in=enrolled_course_ids)
        result = [course for course in courses if course.enrollments.filter(status="active").count() < course.max_students]
        return Response(CourseSerializer(result, many=True).data)

    @action(detail=True, methods=["get"])
    def students(self, request, pk=None):
        course = self.get_object()
        self.ensure_teacher_owns(request, course, "teacher")
        enrollments = Enrollment.objects.filter(course=course, status="active").select_related("student")
        from users.serializers import UserSerializer

        return Response(UserSerializer([item.student for item in enrollments], many=True).data)

    @action(detail=False, methods=["get"])
    def teaching(self, request):
        return Response(CourseSerializer(Course.objects.filter(teacher=request.user), many=True).data)


class EnrollmentViewSet(ActionPermissionMixin, viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    action_permission_classes = {
        "create": [IsAdminRole],
        "update": [IsAdminRole],
        "partial_update": [IsAdminRole],
        "destroy": [IsAdminRole],
    }

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Enrollment.objects.none()
        if user.role == "admin":
            return Enrollment.objects.all()
        if user.role == "teacher":
            return Enrollment.objects.filter(course__teacher=user)
        if user.role == "student":
            return Enrollment.objects.filter(student=user)
        return Enrollment.objects.none()

    def perform_update(self, serializer):
        enrollment = serializer.instance
        status_value = serializer.validated_data.get("status")
        if status_value == "completed" and enrollment.completed_at is None:
            serializer.save(completed_at=timezone.now())
            return
        if status_value != "completed" and enrollment.completed_at is not None:
            serializer.save(completed_at=None)
            return
        serializer.save()
