from django.apps import AppConfig


class StartCrosswordConfig(AppConfig):
    name = 'start_crossword'
    verbose_name = "Кроссворд"
    list_display = ('first_name', 'last_name', 'is_staff')
