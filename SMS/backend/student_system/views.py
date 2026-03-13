from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def index(request):
    return HttpResponse('Student Management System API is running.')


@require_GET
def health(request):
    return JsonResponse({'status': 'ok'})
