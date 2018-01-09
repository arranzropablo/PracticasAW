var loggedUser = "";
var encriptedAuth = "";

$(document).ready(function() {
    $("#loginbtn").on('click', login);
    $("#registerbtn").on('click', register);
});


function login(evt) {
    evt.preventDefault();
    let login = $("#login").val();
    let password = $("#password").val();
    let asdadasd = $("#genericError");
    $("#genericError")[0].classList.remove("text-danger");
    $("#genericError")[0].classList.add("text-info");
    $("#genericError").html("<i class=\"fa fa-clock-o\"></i> Login... Please wait");
    $.ajax({
        method: "POST",
        url: "/login",
        data: JSON.stringify({
            login: login,
            password: password
        }),
        contentType: "application/json",
        statusCode: {
            200: function(data) {
                $("[id$='Error']").html("");
                if (data.exists) {
                    encriptedAuth = btoa(login + ":" + password);
                    loggedUser = login;
                    $("#logued_user").text("Usuario: " + login);
                    $(".container").remove();
                    $("#cards_image").remove();
                    let view = createGamesView();
                    $("#homeDiv").append(view);
                    putActions();
                    $("#list_game").hide();
                } else {
                    $("#genericError")[0].classList.remove("text-info");
                    $("#genericError")[0].classList.add("text-danger");
                    $("#genericError").html("<i class=\"fa fa-close\"></i> Usuario y/o contraseña incorrectos");
                }
            },
            400: function(data) {
                $("[id$='Error']").html("");
                data.responseJSON.message.forEach(error => {
                    $("#" + error.param + "Error").html("<i class=\"fa fa-close\"></i> " + error.msg);
                });
            },
            500: function(data) {
                $("[id$='Error']").html("");
                $("#genericError")[0].classList.remove("text-info");
                $("#genericError")[0].classList.add("text-danger");
                $("#genericError").html("<i class=\"fa fa-close\"></i> Error! Mas información en la consola");
                console.log(data);
            }
        }
    });
}

function register(evt) {
    evt.preventDefault();
    let login = $("#login").val();
    let password = $("#password").val();
    $("#genericError").html("<i class=\"fa fa-clock-o\"></i> Registering... Please wait");
    $.ajax({
        method: "PUT",
        url: "/register",
        data: JSON.stringify({
            login: login,
            password: password
        }),
        contentType: "application/json",
        statusCode: {
            201: function(data) {
                encriptedAuth = btoa(login + ":" + password);
                loggedUser = login;
                $("#logued_user").text("Usuario: " + login);
                $(".container").remove();
                $("#cards_image").remove();
                let view = createGamesView();
                $("#homeDiv").append(view);
                putActions();
            },
            400: function(data) {
                $("[id$='Error']").html("");
                if (data.responseJSON.message instanceof Array) {
                    data.responseJSON.message.forEach(error => {
                        $("#" + error.param + "Error").html("<i class=\"fa fa-close\"></i> " + error.msg);
                    });
                } else {
                    $("#loginError").html("<i class=\"fa fa-close\"></i> " + data.responseJSON.message);
                }
            },
            500: function(data) {
                $("[id$='Error']").html("");
                $("#genericError")[0].classList.remove("text-info");
                $("#genericError")[0].classList.add("text-danger");
                $("#genericError").html("<i class=\"fa fa-close\"></i> Error! Mas información en la consola");
                console.log(data);
            }
        }
    });
}

function createGamesView() {
    let result = $("<div>").addClass("game_view");
    result.append($("<div>").addClass("card").css("style", "18rem").attr("id", "list_game"));
    result.append($("<div>").addClass("card").css("style", "18rem").attr("id", "new_game"));
    result.append($("<div>").addClass("card").css("style", "18rem").attr("id", "join_game"));

    let aux1 = result.children();

    let aux2 = $("<div>").addClass("card-body");
    aux2.append($("<h5>").addClass("card-title").text("Mis partidas"));
    aux2.append($("<p>").addClass("card-text").text("Aquí puedes ver las partidas en las que participas actualmente"));
    aux2.append($("<a>").addClass("games_buttons").addClass("btn btn-primary").attr("id", "list_game_button").text("Ver partidas"));
    aux1.eq(0).append(aux2);

    aux2 = $("<div>").addClass("card-body");
    aux2.append($("<h5>").addClass("card-title").text("Crear nueva partida"));
    aux2.append($("<p>").addClass("card-text").text("Aquí puedes crear una nueva partida con un nombre"));
    aux2.append($("<input type=\"text\" placeholder=\"Introduce nombre de partida\">").addClass("form-control").addClass("games_inputs").attr("id", "new_game_input"));
    aux2.append($("<a>").addClass("games_buttons").addClass("btn btn-primary").attr("id", "new_game_button").text("Crear partida"));
    aux1.eq(1).append(aux2);

    aux2 = $("<div>").addClass("card-body");
    aux2.append($("<h5>").addClass("card-title").text("Unirse a partida existente"));
    aux2.append($("<p>").addClass("card-text").text("Aquí puedes unirte a una partida ya creada"));
    aux2.append($("<input type=\"text\" placeholder=\"Introduce identificador de partida\">").addClass("form-control").addClass("games_inputs").attr("id", "join_game_input"));
    aux2.append($("<a>").addClass("games_buttons").addClass("btn btn-primary").attr("id", "join_game_button").text("Unirse a partida"));
    aux1.eq(2).append(aux2);

    return result;
}

function putActions() {
    $("#list_game_button").on('click', showGamesList);
    $("#new_game_button").on('click', createGame);
    $("#join_game_button").on('click', joinGame);
}

function showGamesList(evt) {

}

function createGame(evt) {

}

function createGame(evt) {

}