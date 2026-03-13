from django.db import models
from users.models import User
from courses.models import Course


class Announcement(models.Model):
    """
    Announcement model: Stores course announcement information
    A course can have multiple announcements, each announcement belongs to one course
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='announcements',
        verbose_name='Course'
    )
    title = models.CharField(
        max_length=200,
        verbose_name='Title'
    )
    content = models.TextField(
        verbose_name='Content'
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='normal',
        verbose_name='Priority'
    )
    is_pinned = models.BooleanField(
        default=False,
        verbose_name='Is Pinned'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Is Active'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_announcements',
        verbose_name='Created By'
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
        db_table = 'announcement'
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        return f"{self.course.name} - {self.title}"
