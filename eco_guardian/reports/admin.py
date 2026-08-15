from django.contrib import admin
from .models import IncidentReport

@admin.register(IncidentReport)
class IncidentReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'reporter', 'status', 'risk_score', 'sensitivity_level', 'created_at')
    list_filter = ('category', 'status', 'sensitivity_level', 'created_at')
    search_fields = ('title', 'description', 'reporter__email', 'reporter__name', 'ai_removal_advice')
    readonly_fields = ('created_at', 'ai_removal_advice')