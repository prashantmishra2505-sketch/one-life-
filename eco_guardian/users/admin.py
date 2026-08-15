from django.contrib import admin
from .models import User, Organization

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'verification_status')
    list_filter = ('verification_status', 'type')
    search_fields = ('name',)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'role', 'verified', 'organization', 'is_active', 'is_staff')
    list_filter = ('role', 'verified', 'is_active', 'is_staff')
    search_fields = ('email', 'name')
    readonly_fields = ('last_login',)
