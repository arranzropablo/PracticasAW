module.exports = function (express, passport) {

    const userController = express.Router();

    userController.get("/games", passport.authenticate('basic', { session: false, failureRedirect: "/user/unauthorized" }), (request, response) => {
        request.daoUsuario.getGames(request.user, (err, games) => {
            if(err){
                response.status(500).json({err});
            } else {
                response.status(200).json(JSON.stringify(games));
            }
        });
    });

    userController.get("/unauthorized", (request, response) =>{
        response.status(403).json({});
    })

    return userController;
}