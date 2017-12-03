module.exports={

    //Middleware que restringe el acceso a login si estas logeado
    restrictLoginTemplate: function(request, response, next) {
        if (request.session.loguedUser) {
            response.redirect("/profile");
        } else {
            next();
        }
    },

    //Middleware que restringe el acceso sin logear
    areYouLoged: function(request, response, next) {
        if (request.session.loguedUser) {
            next();
        } else {
            response.redirect("/login");
        }
    }

}