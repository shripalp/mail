from django.contrib import admin

from .models import User, Email

class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email")

class EmailAdmin(admin.ModelAdmin):
    list_display = ("id","user","sender", "subject", "read", "archived", "timestamp")
    
# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Email, EmailAdmin)