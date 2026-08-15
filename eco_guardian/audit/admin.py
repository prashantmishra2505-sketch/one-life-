from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'incident', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('user__email', 'user__name', 'action', 'incident__title')
    readonly_fields = ('timestamp',)
