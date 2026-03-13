from django.db import models
from users.models import User
from courses.models import Course


class CourseResource(models.Model):
    """
    Course resource model: Stores course learning materials
    A course can have multiple resources, each resource belongs to one course
    """
    RESOURCE_TYPE_CHOICES = [
        ('document', 'Document'),
        ('video', 'Video'),
        ('image', 'Image'),
        ('archive', 'Archive'),
        ('other', 'Other'),
    ]
    
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='resources',
        verbose_name='Course'
    )
    title = models.CharField(
        max_length=200,
        verbose_name='Resource Title'
    )
    description = models.TextField(
        null=True,
        blank=True,
        verbose_name='Resource Description'
    )
    resource_type = models.CharField(
        max_length=20,
        choices=RESOURCE_TYPE_CHOICES,
        default='document',
        verbose_name='Resource Type'
    )
    file = models.FileField(
        upload_to='resources/',
        verbose_name='File'
    )
    file_size = models.IntegerField(
        default=0,
        verbose_name='File Size (bytes)'
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_resources',
        verbose_name='Uploaded By'
    )
    download_count = models.IntegerField(
        default=0,
        verbose_name='Download Count'
    )
    is_visible = models.BooleanField(
        default=True,
        verbose_name='Is Visible'
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
        db_table = 'course_resource'
        verbose_name = 'Course Resource'
        verbose_name_plural = 'Course Resources'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.course.name} - {self.title}"
