module.exports = function (express, passport) {

    const userController = express.Router();

    //TIENE QUE ESTAR IDENTIFICADA CON AUTHORIZATION, SINO 403 (Como hago para qe de un 403 desde el passport?)
    userController.get("/games", passport.authenticate('basic', {session: false}), (request, response) => {
        request.daoUsuario.getGames(request.user, (err, games) => {
            if(err){
                response.status(500).json({err});
            } else {
                response.status(200).json({games});
            }
        });
    });

    return userController;
}