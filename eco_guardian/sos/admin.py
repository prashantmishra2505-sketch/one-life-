from django.contrib import admin
from .models import SOSAlert

@admin.register(SOSAlert)
class SOSAlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'incident', 'response_unit', 'delivery_status', 'sent_at')
    list_filter = ('delivery_status', 'sent_at')
    search_fields = ('incident__title', 'response_unit__name')
    readonly_fields = ('sent_at',)
