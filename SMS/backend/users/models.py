from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    User model: Extends Django's AbstractUser with role field
    """
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student',
        verbose_name='Role'
    )
    student_id = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        verbose_name='Student ID'
    )
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        verbose_name='Employee ID'
    )
    phone = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        verbose_name='Phone'
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        verbose_name='Avatar'
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
        db_table = 'user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
