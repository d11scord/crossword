from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Clue(models.Model):
    answer = models.CharField(max_length=7)
    clue = models.CharField(max_length=200)

    def __str__(self):
        return '{}'.format(self.clue)

    class Meta:
        verbose_name_plural = "Вопросы"
        verbose_name = "вопрос"


Clue._meta.get_field('clue').verbose_name = 'вопрос'
Clue._meta.get_field('answer').verbose_name = 'ответ'


class Statistic(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    bestTime = models.IntegerField(default=0)

    def __str__(self):
        return '{}'.format(self.user)

    @receiver(post_save, sender=User)
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            Statistic.objects.create(user=instance)

    @receiver(post_save, sender=User)
    def save_user_profile(sender, instance, **kwargs):
        instance.statistic.save()

    class Meta:
        verbose_name_plural = "Рейтинг"
        verbose_name = "рейтинг"


Statistic._meta.get_field('user').verbose_name = 'Пользователь'
Statistic._meta.get_field('score').verbose_name = 'Счёт'
Statistic._meta.get_field('bestTime').verbose_name = 'Лучшее время'
