from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskSubmissionViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'submissions', TaskSubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
]
