from django.conf.urls import url
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path

from . import views

urlpatterns = [
    # Страница входа
    # url(r'^login/$', login, name='login'),
    path('login/', LoginView.as_view(template_name='users/login.html'), name="login"),
    # Страница выхода
    path('logout/', LogoutView.as_view(template_name='start_crossword/index.html'), name="logout"),
    # Страница регистрации
    url(r'^register/$', views.register, name='register'),
]
