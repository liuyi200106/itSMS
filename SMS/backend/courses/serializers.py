from rest_framework import serializers
from .models import Course, Enrollment


class CourseSerializer(serializers.ModelSerializer):
    """
    Course serializer: For displaying course information
    """
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    student_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'description', 'teacher', 'teacher_name',
            'credits', 'semester', 'max_students', 'cover_image',
            'is_active', 'student_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Enrollment serializer: For displaying enrollment information
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'course', 'course_name',
            'status', 'enrolled_at', 'completed_at'
        ]
        read_only_fields = ['id', 'enrolled_at']


class StudentCourseSerializer(serializers.ModelSerializer):
    """
    Student course detail serializer: Contains course progress information
    """
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    total_tasks = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'description', 'teacher', 'teacher_name',
            'credits', 'semester', 'cover_image', 'total_tasks', 'completed_tasks', 'progress'
        ]
    
    def get_total_tasks(self, obj):
        """Get total number of tasks for the course"""
        return obj.tasks.count()
    
    def get_completed_tasks(self, obj):
        """Get number of tasks completed by student"""
        student = self.context.get('student')
        if not student:
            return 0
        completed = obj.tasks.filter(
            submissions__student=student,
            submissions__status='graded'
        ).distinct().count()
        return completed
    
    def get_progress(self, obj):
        """Calculate learning progress"""
        total = obj.tasks.count()
        if total == 0:
            return 0
        student = self.context.get('student')
        if not student:
            return 0
        completed = obj.tasks.filter(
            submissions__student=student,
            submissions__status='graded'
        ).distinct().count()
        return round((completed / total) * 100, 2)
