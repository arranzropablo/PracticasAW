var loggedUser = "";
var encriptedAuth = "";

$(document).ready(function() {
    $("#homeDiv").show();

    putActions();

});

function putActions() {
    $("#loginbtn").on('click', login);
    $("#registerbtn").on('click', register);
    $("#list_game_button").on('click', showGamesList);
    $("#new_game_button").on('click', createGame);
    $("#join_game_button").on('click', joinGame);
    $("#logout").on('click', logout);
    $("#games_list").on("click", "button", gameStatus);
    $("#single_game_back").on('click', singleGameGoBack);
    $("#single_game_update").on('click', updateGame);
}

function logout() {
    loggedUser = "";
    encriptedAuth = "";

    $("body>div").hide();
    $("#logout").hide();
    $("#games_list").hide();
    $("#homeDiv").show();
    $("#logued_user").text("");
}

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
                    loginRegisterSuccess(login, password);
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
                loginRegisterSuccess(login, password);
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

function loginRegisterSuccess(login, password) {
    encriptedAuth = btoa(login + ":" + password);
    loggedUser = login;
    $("#logued_user").text("Usuario: " + login);
    $("#homeDiv").hide();
    $("#game_view").show();
    $("#logout").show();
}

function showGamesList(evt) {
    $.ajax({
        method: "GET",
        url: "/user/games",
        beforeSend: function(req) {
            req.setRequestHeader("Authorization", "Basic " + encriptedAuth);
        },
        statusCode: {
            200: function(data) {
                $("#games_list").html("");
                let games = JSON.parse(data);
                if (games.length === 0) {
                    $("#games_list").append($("<li>").text("No tienes ninguna partida"));
                } else {
                    games.forEach(elem => {
                        $("#games_list").append($("<li>").addClass("single_game").html("id: " + elem.id + " Nombre: " + elem.nombre).data("id", elem.id).data("name", elem.nombre).append($("<button>").addClass("btn btn-primary").addClass("detail_button").text("Detalles")));
                    });
                }
                $("#games_list").show();

                //lo del array de fallos no se como se muestra, mirar eso
            },
            403: function(data) {
                $("#errorMsg").html("Fallo en la autenticación");
                $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
            },
            500: function(data) {
                $("#errorMsg").html("Error! Mas información en la consola");
                $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
                console.log(data);
            }
        }
    });
}

function createGame(evt) {
    let nombre = $("#new_game_input").val();

    $.ajax({
        method: "PUT",
        url: "/game/new",
        beforeSend: function(req) {
            req.setRequestHeader("Authorization", "Basic " + encriptedAuth);
        },
        data: JSON.stringify({
            name: nombre
        }),
        contentType: "application/json",
        statusCode: {
            201: function(data) {
                $("#errorMsg").html("Partida creada correctamente. Además, te has unido a ella");
                $("#errorMsg")[0].classList.remove("alert-danger");
                $("#errorMsg")[0].classList.add("alert-success");
                $('#errorMsg').fadeIn(1000);
                $('#errorMsg').delay(3000);
                $('#errorMsg').fadeOut(1000, function() {
                    $("#errorMsg")[0].classList.remove("alert-success");
                    $("#errorMsg")[0].classList.add("alert-danger");
                });
                $("#new_game_input").prop("value", "");
            },
            403: function(data) {
                $("#errorMsg").html("Fallo en la autenticación");
                $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
            },
            500: function(data) {
                $("#errorMsg").html("Error! Mas información en la consola");
                $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
                console.log(data);
            }
        }
    });
}

function joinGame(evt) {
    let id = Number($("#join_game_input").val());
    if (isNaN(id)) {
        $('#errorMsg').html("El identificador debe ser un número");
        $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
    } else {
        $.ajax({
            method: "PUT",
            url: "/game/join/" + id,
            beforeSend: function(req) {
                req.setRequestHeader("Authorization", "Basic " + encriptedAuth);
            },
            statusCode: {
                201: function(data) {
                    $("#errorMsg").html("Te has unido a la partida con identificador: " + id);
                    $("#errorMsg")[0].classList.remove("alert-danger");
                    $("#errorMsg")[0].classList.add("alert-success");
                    $('#errorMsg').fadeIn(1000);
                    $('#errorMsg').delay(3000);
                    $('#errorMsg').fadeOut(1000, function() {
                        $("#errorMsg")[0].classList.remove("alert-success");
                        $("#errorMsg")[0].classList.add("alert-danger");
                    });
                    $("#join_game_input").prop("value", "");
                },
                403: function(data) {
                    $("#errorMsg").html("Fallo en la autenticación");
                    $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
                },
                404: function(data) {
                    $("[id$='Error']").html("");
                    if (data.responseJSON.message instanceof Array) {
                        data.responseJSON.message.forEach(error => {
                            $("#" + error.param + "Error").html("<i class=\"fa fa-close\"></i> " + error.msg);
                        });
                    } else {
                        $("#errorMsg").html(data.responseJSON.message);
                        $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
                    }
                },
                500: function(data) {
                    $("#errorMsg").html(data.responseJSON.message);
                    $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
                }
            }
        });
    }
}

function gameStatus(evt) {
    let game = $(evt.target).parent();
    $.ajax({
        method: "GET",
        url: "/game/players/" + game.data("id"),
        beforeSend: function(req) {
            req.setRequestHeader("Authorization", "Basic " + encriptedAuth);
        },
        statusCode: {
            200: function(data) {
                $("#game_name").text(game.data("name"));
                $("#game_info").text("El identificador de esta partida es " + game.data("id"));
                $("#game_name").data("id", game.data("id"));

                loadGameData(data);

                $("#game_view").hide();
                $("#single_game_view").show();
            },
            403: function(data) {
                $("#errorMsg").html("Fallo en la autenticación");
                $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
            },
            500: function(data) {
                $("#errorMsg").html("Error! Mas información en la consola");
                $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
                console.log(data);
            }
        }
    });
}

function singleGameGoBack() {
    $("#single_game_view").hide();
    $("#games_list").hide();
    $("#game_view").show();

}

function updateGame() {
    let name = $("#game_name").val();
    let id = $("#game_name").data("id");

    $.ajax({
        method: "GET",
        url: "/game/players/" + id,
        beforeSend: function(req) {
            req.setRequestHeader("Authorization", "Basic " + encriptedAuth);
        },
        statusCode: {
            200: function(data) {
                loadGameData(data);

                $("#game_view").hide();
                $("#single_game_view").show();
            },
            403: function(data) {
                $("#errorMsg").html("Fallo en la autenticación");
                $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
            },
            500: function(data) {
                $("#errorMsg").html("Error! Mas información en la consola");
                $('#errorMsg').fadeIn(1000).delay(2500).fadeOut(1000);
                console.log(data);
            }
        }
    });
}

function loadGameData(data) {
    for (let i = 1; i <= 4; ++i) {
        if (i <= data.length) {
            $("#playerName" + i).text(data[i - 1].login);
        } else {
            $("#playerName" + i).text("-");
        }
        $("#playerCards" + i).text("-");
    }

    if (data.length < 4) $("#game_completed").text("La partida está incompleta. Esperando jugadores...");
    else $("#game_completed").text("La partida está completa");
}

/*function createGamesView() {
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
}*/