from rest_framework import serializers
from .models import Task, TaskSubmission


class TaskSerializer(serializers.ModelSerializer):
    """
    Task serializer: For displaying task information
    """
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'course', 'course_name', 'title', 'description',
            'due_date', 'total_score', 'weight', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaskSubmissionSerializer(serializers.ModelSerializer):
    """
    Task submission serializer: For displaying submission information
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = TaskSubmission
        fields = [
            'id', 'student', 'student_name', 'task', 'task_title',
            'content', 'attachment', 'score', 'feedback',
            'status', 'status_display', 'submitted_at', 'graded_at'
        ]
        read_only_fields = ['id', 'submitted_at', 'graded_at']


class StudentTaskSerializer(serializers.ModelSerializer):
    """
    Student task serializer: Contains submission status
    """
    course_name = serializers.CharField(source='course.name', read_only=True)
    submission_status = serializers.SerializerMethodField()
    submission_id = serializers.SerializerMethodField()
    score = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'course', 'course_name', 'title', 'description',
            'due_date', 'total_score', 'weight', 'submission_status',
            'submission_id', 'score', 'created_at'
        ]
    
    def get_submission_status(self, obj):
        """Get submission status"""
        student = self.context.get('student')
        if not student:
            return 'pending'
        submission = obj.submissions.filter(student=student).first()
        if submission:
            return submission.status
        return 'pending'
    
    def get_submission_id(self, obj):
        """Get submission ID"""
        student = self.context.get('student')
        if not student:
            return None
        submission = obj.submissions.filter(student=student).first()
        return submission.id if submission else None
    
    def get_score(self, obj):
        """Get score"""
        student = self.context.get('student')
        if not student:
            return None
        submission = obj.submissions.filter(student=student).first()
        return submission.score if submission and submission.score else None
