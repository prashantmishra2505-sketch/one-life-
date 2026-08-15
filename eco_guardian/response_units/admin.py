from django.contrib import admin
from .models import ResponseUnit

@admin.register(ResponseUnit)
class ResponseUnitAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'jurisdiction', 'availability')
    list_filter = ('availability', 'jurisdiction')
    search_fields = ('name', 'phone', 'jurisdiction')
