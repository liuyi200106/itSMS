from django.db import models
from users.models import User


class Course(models.Model):
    """
    Course model: Stores course basic information
    A teacher can teach multiple courses, each course has only one teacher
    """
    name = models.CharField(
        max_length=200,
        verbose_name='Course Name'
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Course Code'
    )
    description = models.TextField(
        verbose_name='Course Description'
    )
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='teaching_courses',
        limit_choices_to={'role': 'teacher'},
        verbose_name='Teacher'
    )
    credits = models.IntegerField(
        default=0,
        verbose_name='Credits'
    )
    semester = models.CharField(
        max_length=50,
        verbose_name='Semester'
    )
    max_students = models.IntegerField(
        default=50,
        verbose_name='Max Students'
    )
    cover_image = models.ImageField(
        upload_to='course_covers/',
        null=True,
        blank=True,
        verbose_name='Cover Image'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Is Active'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Created At'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Updated At'
    )
    
    class Meta:
        db_table = 'course'
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    @property
    def student_count(self):
        """Get enrolled student count"""
        return self.enrollments.count()


class Enrollment(models.Model):
    """
    Enrollment model: Many-to-many relationship between students and courses
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'student'},
        verbose_name='Student'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name='Course'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name='Status'
    )
    enrolled_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Enrolled At'
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Completed At'
    )
    
    class Meta:
        db_table = 'enrollment'
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
        unique_together = ['student', 'course']
        ordering = ['-enrolled_at']
    
    def __str__(self):
        return f"{self.student.username} - {self.course.name}"
