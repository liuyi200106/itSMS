from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from courses.models import Enrollment, Course
from student_system.mixins import ActionPermissionMixin, RoleOwnershipMixin
from student_system.permissions import IsStudentRole, IsTeacherOrAdmin, IsTeacherRole

from .models import Task, TaskSubmission
from .serializers import StudentTaskSerializer, TaskSerializer, TaskSubmissionSerializer


class TaskViewSet(ActionPermissionMixin, RoleOwnershipMixin, viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    action_permission_classes = {
        "create": [IsTeacherOrAdmin],
        "update": [IsTeacherOrAdmin],
        "partial_update": [IsTeacherOrAdmin],
        "destroy": [IsTeacherOrAdmin],
        "my_tasks": [IsStudentRole],
        "pending": [IsStudentRole],
    }

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Task.objects.none()
        if user.role == "student":
            enrolled_course_ids = Enrollment.objects.filter(student=user, status="active").values_list("course_id", flat=True)
            return Task.objects.filter(course_id__in=enrolled_course_ids)
        if user.role == "teacher":
            return Task.objects.filter(course__teacher=user)
        return Task.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role == "teacher":
            course_id = self.request.data.get("course")
            if not Course.objects.filter(id=course_id, teacher=self.request.user).exists():
                raise PermissionDenied("You can only create tasks for your own courses.")
        serializer.save()

    def perform_update(self, serializer):
        self.ensure_teacher_owns(self.request, serializer.instance, "course.teacher")
        serializer.save()

    def perform_destroy(self, instance):
        self.ensure_teacher_owns(self.request, instance, "course.teacher")
        instance.delete()

    @action(detail=False, methods=["get"])
    def my_tasks(self, request):
        tasks = self.get_queryset()
        return Response(StudentTaskSerializer(tasks, many=True, context={"student": request.user}).data)

    @action(detail=False, methods=["get"])
    def pending(self, request):
        enrolled_course_ids = Enrollment.objects.filter(student=request.user, status="active").values_list("course_id", flat=True)
        tasks = Task.objects.filter(course_id__in=enrolled_course_ids)
        submitted_task_ids = TaskSubmission.objects.filter(student=request.user).values_list("task_id", flat=True)
        pending_tasks = tasks.exclude(id__in=submitted_task_ids)
        return Response(StudentTaskSerializer(pending_tasks, many=True, context={"student": request.user}).data)


class TaskSubmissionViewSet(ActionPermissionMixin, RoleOwnershipMixin, viewsets.ModelViewSet):
    queryset = TaskSubmission.objects.all()
    serializer_class = TaskSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    action_permission_classes = {
        "create": [IsStudentRole],
        "grade": [IsTeacherRole],
        "course_submissions": [IsTeacherRole],
    }

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return TaskSubmission.objects.none()
        if user.role == "student":
            return TaskSubmission.objects.filter(student=user)
        if user.role == "teacher":
            return TaskSubmission.objects.filter(task__course__teacher=user)
        return TaskSubmission.objects.all()

    def perform_create(self, serializer):
        task_id = self.request.data.get("task")
        task = Task.objects.filter(id=task_id).first()
        if task is None:
            raise ValidationError({"task": "Task does not exist."})
        if not Enrollment.objects.filter(student=self.request.user, course=task.course, status="active").exists():
            raise PermissionDenied("You can only submit tasks for enrolled courses.")
        if TaskSubmission.objects.filter(student=self.request.user, task=task).exists():
            raise ValidationError({"error": "You have already submitted this task."})
        serializer.save(student=self.request.user, status="submitted")

    @action(detail=True, methods=["post"])
    def grade(self, request, pk=None):
        submission = self.get_object()
        self.ensure_teacher_owns(request, submission, "task.course.teacher")

        score = request.data.get("score")
        feedback = request.data.get("feedback", "")
        if score is None:
            return Response({"error": "Please provide a score"}, status=400)

        try:
            score = float(score)
        except (TypeError, ValueError):
            return Response({"error": "Score must be a number"}, status=400)

        if score < 0 or score > submission.task.total_score:
            return Response({"error": f"Score must be between 0 and {submission.task.total_score}"}, status=400)

        submission.score = score
        submission.feedback = feedback
        submission.status = "graded"
        submission.graded_at = timezone.now()
        submission.save()
        return Response(TaskSubmissionSerializer(submission).data)

    @action(detail=False, methods=["get"])
    def course_submissions(self, request):
        course_id = request.query_params.get("course_id")
        if not course_id:
            return Response({"error": "Please provide course ID"}, status=400)

        submissions = TaskSubmission.objects.filter(task__course_id=course_id, task__course__teacher=request.user)
        return Response(TaskSubmissionSerializer(submissions, many=True).data)
