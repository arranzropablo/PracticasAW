$(document).ready(function(){
    $("#loginbtn").on('click', evt => {
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
            contentType:"application/json",
            statusCode:{
                200: function(data){
                    $("[id$='Error']").html("");
                    if(data.correct){
                        //Cargamos la sig pagina
                    } else {
                        $("#genericError")[0].classList.remove("text-info");
                        $("#genericError")[0].classList.add("text-danger");
                        $("#genericError").html("<i class=\"fa fa-close\"></i> Usuario y/o contraseña incorrectos");
                    }
                },
                400: function(data){
                    $("[id$='Error']").html("");
                    data.responseJSON.message.forEach(error => {
                        $("#"+ error.param +"Error").html("<i class=\"fa fa-close\"></i> " + error.msg);
                    });
                },
                500: function(data){
                    $("[id$='Error']").html("");
                    $("#genericError")[0].classList.remove("text-info");
                    $("#genericError")[0].classList.add("text-danger");
                    $("#genericError").html("<i class=\"fa fa-close\"></i> Error! Mas información en la consola");
                    console.log(data);
                }
            }
        });
    });

    $("#registerbtn").on('click', evt => {
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
            contentType:"application/json",
            statusCode:{
                201: function(data){
                    $("[id$='Error']").html("");
                    //cargamos la sig pagina
                },
                400: function(data){
                    $("[id$='Error']").html("");
                    if (data.responseJSON.message instanceof Array){
                        data.responseJSON.message.forEach(error => {
                            $("#"+ error.param +"Error").html("<i class=\"fa fa-close\"></i> " + error.msg);
                        });
                    } else {
                        $("#loginError").html("<i class=\"fa fa-close\"></i> " + data.responseJSON.message);
                    }
                },
                500: function(data){
                    $("[id$='Error']").html("");
                    $("#genericError")[0].classList.remove("text-info");
                    $("#genericError")[0].classList.add("text-danger");
                    $("#genericError").html("<i class=\"fa fa-close\"></i> Error! Mas información en la consola");
                    console.log(data);
                }
            }
        });
    });
});