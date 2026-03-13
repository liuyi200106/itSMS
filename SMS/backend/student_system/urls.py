from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('courses.urls')),
    path('api/', include('tasks.urls')),
    path('api/', include('resources.urls')),
    path('api/', include('announcements.urls')),
    path('api/health/', views.health, name='health'),
    path('', views.index, name='index'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
