from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseResourceViewSet

router = DefaultRouter()
router.register(r'resources', CourseResourceViewSet, basename='resource')

urlpatterns = [
    path('', include(router.urls)),
]
