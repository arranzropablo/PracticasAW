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
                        if (players.length + 1 === 4) {
                            //Esta funcion hay que hacerla asincrona. Por ahora reparte las cartas aleatoriamente y las guarda en la base de datos
                            request.daoUsuario.getUserByNickname(request.user, (err, user) => {
                                if (err) {
                                    response.status(500).json({ message: err });
                                } else {
                                    players.push(user);
                                    startGame(request.daoJuegos, players, Number(request.params.id), (err, gameData) => {
                                        if (err) {
                                            response.status(500).json(err)
                                        } else {
                                            response.status(201).json(gameData)
                                        };
                                    });
                                }
                            });
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

    function startGame(daoJuegos, players, idGame, callback) {
        let cards = [];
        let cardsPlayers = [];
        cardsPlayers[0] = [];
        cardsPlayers[1] = [];
        cardsPlayers[2] = [];
        cardsPlayers[3] = [];

        for (let i = 0; i < 52; ++i) {
            cards.push(i);
        }

        let cartas = 51;
        for (let i = 0; i < 52; ++i) {

            //Saca una posicion aleatoria del array
            let aleatorio = Math.round(Math.random() * cartas);
            //Disminuye el numero de cartas (ya que ahora hay menos cartas donde elegir)
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
            cardsPlayers[Math.floor(i / 13)].push({ numero: numero, palo: palo });
        }

        //Falta tambien asignar el turno aleatoriamente
        //let turno = Math.round(Math.random() * 3) + 1; //...

        //Guardamos las cartas en la base de datos
        daoJuegos.setCards(players[0], cardsPlayers[0], idGame, err1 => {
            if (!err1) {
                daoJuegos.setCards(players[1], cardsPlayers[1], idGame, err2 => {
                    if (!err2) {
                        daoJuegos.setCards(players[2], cardsPlayers[2], idGame, err3 => {
                            if (!err3) {
                                daoJuegos.setCards(players[3], cardsPlayers[3], idGame, err4 => {
                                    if (!err4) {
                                        //Si todo va bien, creamos un objeto con los datos que se necesitan para comenzar la partida
                                        let gameData = {
                                            players: players, //Jugadores de la partida (quiza esto no hace falta ya que ya lo tenemos fuera de la funcion)
                                            idGame: idGame, //Id de la partida

                                        }

                                        gameData.cards = cardsPlayers[players.length - 1]; //Cartas del jugador que hace la petición (para no acceder de nuevo a la bd)
                                        gameData.currentPlayer = players[players.length - 1]; //Jugador que hace la petición (último en unirse)

                                        callback(null, gameData);
                                    } else { callback(err4, undefined) }
                                });
                            } else { callback(err3, undefined) }
                        });
                    } else { callback(err2, undefined) }
                });
            } else { callback(err1, undefined) }
        });

    }

    return gameController;
}