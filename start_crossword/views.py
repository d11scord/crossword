from django.http import JsonResponse
from start_crossword.models import Clue, Statistic, User
from start_crossword.static.res import crossword
from django.shortcuts import render


def index(request):
    return render(request, 'start_crossword/index.html', context={})


def get_crossword(request):
    word_list = Clue.objects.values_list('answer', 'clue')
    context = crossword.generate_crossword(word_list)
    return JsonResponse(context, safe=False)


def send_result(request):
    if request.user.is_authenticated:
        update_profile(request, request.user.id)
    return JsonResponse(data=None, safe=False)


def update_profile(request, user):
    user = User.objects.get(pk=user)
    user.statistic.score += 250
    newtime = int(request.POST['time'])  # puzzle time here
    if newtime < user.statistic.bestTime or user.statistic.bestTime == 0:
        user.statistic.bestTime = newtime
    user.save()


def sort_val(v):
    return v[0][1]


def sort_key(k):
    return k[0]


def get_rating(request):
    current_user = request.user.id
    score_rating = list(Statistic.objects.values_list('user_id', 'score'))
    time_rating = list(Statistic.objects.values_list('user_id', 'bestTime'))
    users = list(User.objects.values_list('id', 'username'))

    score_rating.sort(key=sort_key, reverse=True)
    time_rating.sort(key=sort_key, reverse=True)
    users.sort(key=sort_key, reverse=True)

    score_rating = list(zip(score_rating, users))

    score_rating.sort(key=sort_val, reverse=True)
    for i in range(len(score_rating)):
        score_rating[i] = list(score_rating[i][0]) + list(score_rating[i][1])

    time_rating = list(zip(time_rating, users))
    time_rating.sort(key=sort_val, reverse=False)
    for i in range(len(time_rating)):
        time_rating[i] = list(time_rating[i][0]) + list(time_rating[i][1])

    i = 0
    while 0 in time_rating[i]:
        time_rating.remove(time_rating[i])

    score_rating = score_rating[:10]
    time_rating = time_rating[:10]

    context = {'score': score_rating, 'time': time_rating}

    return JsonResponse(context, safe=False)



