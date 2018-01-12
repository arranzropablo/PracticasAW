module.exports = function(express, passport) {

    const gameController = express.Router();

    gameController.get("/players/:id", passport.authenticate('basic', { session: false, failureRedirect: "/user/unauthorized" }), (request, response) => {
        request.daoJuegos.getPlayers(request.params.id, (err, players) => {
            if (err) {
                response.status(500).json({ err });
            } else if (players.length > 0) {
                response.status(200).json(players);
            } else {
                response.status(404).json({ message: "No existe la partida" });
            }
        });
    });

    gameController.put("/new", passport.authenticate('basic', { session: false, failureRedirect: "/user/unauthorized" }), (request, response) => {
        request.daoJuegos.newGame(request.body.name, request.user, (err, result) => {
            if (err) {
                response.status(500).json({ err });
            } else {
                response.status(201).json({});
            }
        });
    });

    gameController.put("/join/:id", passport.authenticate('basic', { session: false, failureRedirect: "/user/unauthorized" }), (request, response) => {
        request.daoJuegos.getPlayers(Number(request.params.id), (err, players) => {
            if (err) {
                response.status(500).json({ message: err });
            } else if (players.length >= 4) {
                response.status(404).json({ message: "La partida está completa" });
            } else if (players.length > 0) {
                request.daoJuegos.joinGame(Number(request.params.id), request.user, (err, exito) => {
                    if (err) {
                        response.status(500).json({ message: err });
                    } else {
                        if (players.length + 1 == 4) {
                            //Esta funcion hay que hacerla asincrona. Por ahora reparte las cartas aleatoriamente y las guarda en la base de datos
                            startGame(request.daoJuegos, players, Number(request.params.id));
                            response.status(201).json({});
                        } else {
                            response.status(201).json({});
                        }
                    }
                });
            } else {
                response.status(404).json({ message: "No existe la partida" });
            }
        });
    });

    function startGame(daoJuegos, players, idGame) {
        let cards = [];
        let cardsPlayer1 = [];
        let cardsPlayer2 = [];
        let cardsPlayer3 = [];
        let cardsPlayer4 = [];
        for (let i = 0; i < 52; ++i) {
            cards.push(i);
        }

        let cartas = 51;
        for (let i = 0; i < 52; ++i) {

            //saca una posicion aleatoria del array
            let aleatorio = Math.round(Math.random() * cartas);
            //disminuye el numero de cartas (ya que ahora hay menos cartas donde elegir)
            cartas--;
            //Cogemos el valor de la carta y borramos la posicion para que no se pueda volver a coger
            let carta = cards[aleatorio];
            cards.splice(aleatorio, 1);

            let numero;
            let palo;

            //Sacamos el numero de la carta
            if (carta % 13 === 10) {
                numero = "J";
            } else if (carta % 13 === 11) {
                numero = "Q";
            } else if (carta % 13 === 12) {
                numero = "K";
            } else {
                numero = (carta % 13) + 1;
            }

            //Sacamos el palo
            if (Math.floor(carta / 13) === 0) {
                palo = "D";
            } else if (Math.floor(carta / 13) === 1) {
                palo = "P";
            } else if (Math.floor(carta / 13) === 2) {
                palo = "C";
            } else {
                palo = "T";
            }

            //Introducimos la carta al jugador correspondiente
            if ((Math.floor(i / 13) === 0)) {
                cardsPlayer1.push({ numero: numero, palo: palo });
            } else if ((Math.floor(i / 13) === 1)) {
                cardsPlayer2.push({ numero: numero, palo: palo });
            } else if ((Math.floor(i / 13) === 2)) {
                cardsPlayer3.push({ numero: numero, palo: palo });
            } else {
                cardsPlayer4.push({ numero: numero, palo: palo });
            }
        }

        //Falta tambien asignar el turno aleatoriamente
        //let turno = Math.round(Math.random() * 3) + 1; //...

        //Guardamos las cartas en la base de datos
        //AQUI FALTA GESTIONAR LOS ERRORES, pero si no hay errores en la bd lo inserta bien
        daoJuegos.setCards(players[0], cardsPlayer1, idGame, err1 => {
            if (!err1) {
                daoJuegos.setCards(players[1], cardsPlayer2, idGame, err2 => {
                    if (!err2) {
                        daoJuegos.setCards(players[2], cardsPlayer3, idGame, err3 => {
                            if (!err3) {
                                daoJuegos.setCards(players[3], cardsPlayer4, idGame, err4 => {
                                    if (!err4) {

                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    }

    return gameController;
}