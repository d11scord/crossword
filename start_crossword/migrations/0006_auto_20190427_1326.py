# Generated by Django 2.2 on 2019-04-27 10:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('start_crossword', '0005_remove_profile_besttime'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='bestTime',
            field=models.CharField(default=0, max_length=30),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='profile',
            name='score',
            field=models.CharField(max_length=30),
        ),
    ]
