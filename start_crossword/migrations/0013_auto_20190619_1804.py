# Generated by Django 2.2 on 2019-06-19 15:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('start_crossword', '0012_auto_20190523_1503'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clue',
            name='answer',
            field=models.CharField(max_length=7),
        ),
    ]
