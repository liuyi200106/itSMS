from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    """
    Announcement serializer
    """
    creator_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Announcement
        fields = [
            'id', 'course', 'title', 'content', 'priority', 'priority_display',
            'is_pinned', 'is_active', 'created_by', 'creator_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
