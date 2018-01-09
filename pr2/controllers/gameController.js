module.exports = function(express, passport) {

    const gameController = express.Router();

    //TIENE QUE ESTAR IDENTIFICADA CON AUTHORIZATION, SINO 403
    gameController.get("/players/:id", passport.authenticate('basic', { session: false }), (request, response) => {
        request.daoJuegos.getPlayers(request.params.id, (err, players) => {
            if (err) {
                response.status(500).json({ err });
            } else if (players.length > 0) {
                response.status(200).json({ players });
            } else {
                response.status(404).json({ message: "No existe la partida" });
            }
        });
    });

    //TIENE QUE ESTAR IDENTIFICADA CON AUTHORIZATION, SINO 403
    gameController.put("/new", passport.authenticate('basic', { session: false }), (request, response) => {
        request.daoJuegos.newGame(request.body.name, request.user, (err, result) => {
            if (err) {
                response.status(500).json({ err });
            } else {
                response.status(201).json({});
            }
        });
    });

    //TIENE QUE ESTAR IDENTIFICADA CON AUTHORIZATION, SINO 403
    gameController.put("/join/:id", passport.authenticate('basic', { session: false }), (request, response) => {
        request.daoJuegos.getPlayers(request.params.id, (err, players) => {
            if (err) {
                response.status(500).json({ err });
            } else if (players.length >= 4) {
                response.status(404).json({ message: "La partida está completa" });
            } else if (players.length > 0) {
                request.daoJuegos.joinGame(request.params.id, request.user, (err, players) => {
                    if (err) {
                        response.status(500).json({ message: err });
                    } else {
                        response.status(201).json({});
                    }
                });
            } else {
                response.status(404).json({ message: "No existe la partida" });
            }
        });
    });

    return gameController;
}