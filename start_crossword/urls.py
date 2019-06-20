from django.conf.urls import url
from django.contrib import admin
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'crossword', views.get_crossword),
    url(r'send', views.send_result),
    url(r'rating', views.get_rating),
    url(r'^admin/', admin.site.urls),
]
