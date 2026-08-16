from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from reports.views import OfficerDashboardView, IncidentStatusUpdateView
from sos.views import SOSDispatchView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/dashboard/', OfficerDashboardView.as_view(), name='dashboard'),
    path('api/incidents/<int:pk>/status/', IncidentStatusUpdateView.as_view(), name='incident-status-update'),
    path('api/sos/<int:incident_id>/', SOSDispatchView.as_view(), name='sos-dispatch'),
]

# Serve media files in production for this prototype
from django.views.static import serve
from django.urls import re_path

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
