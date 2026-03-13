from rest_framework import serializers
from .models import CourseResource


class CourseResourceSerializer(serializers.ModelSerializer):
    """
    Course resource serializer
    """
    uploader_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    resource_type_display = serializers.CharField(source='get_resource_type_display', read_only=True)
    
    class Meta:
        model = CourseResource
        fields = [
            'id', 'course', 'title', 'description', 'resource_type',
            'resource_type_display', 'file', 'file_size', 'uploaded_by',
            'uploader_name', 'download_count', 'is_visible', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'download_count', 'created_at', 'updated_at']
