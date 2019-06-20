from django.contrib import admin
from .models import Clue, Statistic, User
from django.contrib.auth.models import Group

admin.site.site_title = 'Кроссворд'
admin.site.site_header = 'Панель администратора'


class ClueAdmin(admin.ModelAdmin):
    list_display = ('answer', 'clue')
    list_per_page = 25


class StatisticAdmin(admin.ModelAdmin):
    list_display = ('user', 'score', 'bestTime')


class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'is_staff')


admin.site.register(Clue, ClueAdmin)
admin.site.register(Statistic, StatisticAdmin)
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.unregister(Group)
