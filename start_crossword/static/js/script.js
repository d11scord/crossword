var startGameBtn = document.getElementById("start-game");
var getRatingBtn = document.getElementById("get-rating");
var time = 0, interval;
var spinner = document.getElementById("load-spinner");
var showRating = false;
spinner.style.display = 'none';
startGameBtn.addEventListener("click", function() {
    spinner.style.display = 'block';
    var addP = document.getElementsByClassName('add-puzzle'); //можешь переписать на jQuery
    addP[0].style.display="block";
    $('.start-game').removeClass('col-lg-6');
    $('.start-game').addClass('col-lg-4');
    $('.rating').removeClass('col-lg-6');
    $('.rating').addClass('col-lg-4');
    $('.clue-head-down').empty();
    $('.clue-head-across').empty();
    $('#down').empty();
    $('#across').empty();
    $('#puzzle-wrapper').empty();
    clearInterval(interval);
    $('#timer').empty();
    let request = new XMLHttpRequest();
    request.open("GET", '/crossword');
    request.onload = function() {
        $('.clue-head-down').append('По вертикали');
        $('.clue-head-across').append('По горизонтали');
        $('#start-game').text('Новый кроссворд');
        $('#puzzle-wrapper').crossword(JSON.parse(request.responseText));
        spinner.style.display = 'none';
        setTimer();
    }
    request.send();
})

getRatingBtn.addEventListener("click", function(){
    if(!showRating){
        $('#score-rating').empty().removeClass("zoomOutUp").addClass("animated zoomInUp");
        $('#time-rating').empty().removeClass("zoomOutUp").addClass("animated zoomInUp");
        let request = new XMLHttpRequest();
        request.open("GET", '/rating');
        request.onload = function(){
            console.log(JSON.parse(request.responseText));
            drawTables(JSON.parse(request.responseText));
        }
        request.send();
        showRating = true;
    }else{
        $('#score-rating').removeClass("zoomInUp").addClass("zoomOutUp");
        $('#time-rating').removeClass("zoomInUp").addClass("zoomOutUp");
        showRating = false;
    }
})

function drawTables(json){
    let tbl, tblBody, row, cell, cellText;
    scores = json['score'].length;
    times = json['time'].length;
    let scores_parent = document.getElementById("score-rating");
    tbl = document.createElement("table")
    $(tbl).addClass("table table-striped");
    tblBody = document.createElement("tbody");

    row = document.createElement("tr");

    cell = document.createElement("td");
    cellText = document.createTextNode("#");
    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode("Имя");
    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode("Очки");
    cell.appendChild(cellText);
    row.appendChild(cell);

    row.style.fontWeight = 'bold';
    tblBody.appendChild(row);

    for (let i = 0; i < scores; i++) {
        row = document.createElement("tr");

        cell = document.createElement("td");
        cellText = document.createTextNode(i+1);
        cell.appendChild(cellText);
        row.appendChild(cell);

        cell = document.createElement("td");
        cellText = document.createTextNode(json['score'][i][3]);
        cell.appendChild(cellText);
        row.appendChild(cell);

        cell = document.createElement("td");
        cellText = document.createTextNode(json['score'][i][1]);
        cell.appendChild(cellText);
        row.appendChild(cell);

        tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    scores_parent.appendChild(tbl);

    let times_parent = document.getElementById("time-rating");
    tbl = document.createElement("table");
    $(tbl).addClass("table table-striped");
    tblBody = document.createElement("tbody");

        row = document.createElement("tr");

        cell = document.createElement("td");
        cellText = document.createTextNode("#");
        cell.appendChild(cellText);
        row.appendChild(cell);

        cell = document.createElement("td");
        cellText = document.createTextNode("Имя");
        cell.appendChild(cellText);
        row.appendChild(cell);

        cell = document.createElement("td");
        cellText = document.createTextNode("Время");
        cell.appendChild(cellText);
        row.appendChild(cell);

        row.style.fontWeight = 'bold';
        tblBody.appendChild(row);

    for (let i = 0; i < times; i++) {
        row = document.createElement("tr");

        cell = document.createElement("td");
        cellText = document.createTextNode(i+1);
        cell.appendChild(cellText);
        row.appendChild(cell);

        cell = document.createElement("td");
        cellText = document.createTextNode(json['time'][i][3]);
        cell.appendChild(cellText);
        row.appendChild(cell);

        cell = document.createElement("td");
        cellText = document.createTextNode(json['time'][i][1]);
        cell.appendChild(cellText);
        row.appendChild(cell);

        tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    times_parent.appendChild(tbl);
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var setTimer = function(){
    time = 0;
    clearInterval(interval);
    let seconds = 0, minutes = 0, hours = 0;
    interval = setInterval(function() {
        seconds++;
        time++;
        if(seconds == 60){
            seconds = 0;
            minutes++;
        }
        if(minutes == 60){
            minutes = 0;
            hours++;
        }
        $('#timer').text((hours<=9 ? "0" : "") + hours + ":" + (minutes<=9 ? "0" : "") + minutes + ":" + (seconds<=9 ? "0" : "") + seconds);
    }, 1000);
}

var send_result = function(){
    clearInterval(interval);
    show_message();
    $.ajax({
        url: '/send',
        type: 'POST',
        dataType: 'json',
        data: ({'csrfmiddlewaretoken': getCookie('csrftoken'), 'time': time})
    });
}

var show_message = function() {
  let x = document.getElementById("snackbar");
  let last = time.toString().split('').pop();
  let message = "Поздравляем! Ты прошёл кроссворд за " + time
  switch(last){
    case '1':
        if(time == 11){
            message = message.concat(" секунд");
            break;
        }
        message = message.concat(" секунду");
        break;
    case '2':
    case '3':
    case '4':
        if (time == 12 || time == 13 || time == 14){
            message = message.concat(" секунд");
            break;
        }
        message = message.concat(" секунды");
        break;
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
    case '0':
        message = message.concat(" секунд");
        break;
    default:
        message = message.concat(" с.");
  }

  x.className = "show";
  x.innerHTML = message;
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}