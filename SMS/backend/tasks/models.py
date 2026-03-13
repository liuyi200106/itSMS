from django.db import models
from users.models import User
from courses.models import Course


class Task(models.Model):
    """
    Task model: Stores course task information
    A course contains multiple tasks, each task belongs to one course
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
    ]
    
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='tasks',
        verbose_name='Course'
    )
    title = models.CharField(
        max_length=200,
        verbose_name='Title'
    )
    description = models.TextField(
        verbose_name='Description'
    )
    due_date = models.DateTimeField(
        verbose_name='Due Date'
    )
    total_score = models.FloatField(
        default=100.0,
        verbose_name='Total Score'
    )
    weight = models.FloatField(
        default=1.0,
        verbose_name='Weight'
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
        db_table = 'task'
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        ordering = ['due_date']
    
    def __str__(self):
        return f"{self.course.name} - {self.title}"


class TaskSubmission(models.Model):
    """
    Task submission model: Stores student task submission records
    """
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='task_submissions',
        limit_choices_to={'role': 'student'},
        verbose_name='Student'
    )
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name='Task'
    )
    content = models.TextField(
        verbose_name='Content'
    )
    attachment = models.FileField(
        upload_to='submissions/',
        null=True,
        blank=True,
        verbose_name='Attachment'
    )
    score = models.FloatField(
        null=True,
        blank=True,
        verbose_name='Score'
    )
    feedback = models.TextField(
        null=True,
        blank=True,
        verbose_name='Feedback'
    )
    status = models.CharField(
        max_length=20,
        choices=Task.STATUS_CHOICES,
        default='pending',
        verbose_name='Status'
    )
    submitted_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Submitted At'
    )
    graded_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Graded At'
    )
    
    class Meta:
        db_table = 'task_submission'
        verbose_name = 'Task Submission'
        verbose_name_plural = 'Task Submissions'
        unique_together = ['student', 'task']
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.student.username} - {self.task.title}"
