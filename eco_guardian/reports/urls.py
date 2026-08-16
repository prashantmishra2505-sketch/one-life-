from django.urls import path
from .views import ReportListCreateView, ReportDetailUpdateView, PublicReportListView

urlpatterns = [
    path('public/', PublicReportListView.as_view(), name='report-list-public'),
    path('', ReportListCreateView.as_view(), name='report-list-create'),
    path('<int:pk>/', ReportDetailUpdateView.as_view(), name='report-detail-update'),
]
