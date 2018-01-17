module.exports = function(express, passport) {

    const gameController = express.Router();

    gameController.get("/status/:id", passport.authenticate('basic', { session: false, failureRedirect: "/user/unauthorized" }), (request, response) => {
        request.daoJuegos.getStatus(request.params.id, (err, status) => {
            if (err) {
                response.status(500).json({ err });
            } else if (status === null) {
                response.status(404).json({ message: "No existe la partida" });
            } else {
                response.status(200).json(JSON.parse(status));
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
                        request.daoUsuario.getUserByNickname(request.user, (err, user) => {
                            if (err) {
                                response.status(500).json({ message: err });
                            } else {
                                if (players.length + 1 === 4) {
                                    players.push(user);
                                    startGame(request.daoJuegos, players, Number(request.params.id), (err) => {
                                        if (err) {
                                            response.status(500).json(err)
                                        } else {
                                            response.status(201).json({});
                                        };
                                    });
                                } else {
                                    response.status(201).json({});
                                }
                            }
                        });
                    }
                });
            } else {
                response.status(404).json({ message: "No existe la partida" });
            }
        });
    });

    gameController.post("/action/:id", passport.authenticate('basic', { session: false, failureRedirect: "/user/unauthorized" }), (request, response) => {
        let status = request.body.status;
        request.daoJuegos.setGameState(Number(request.params.id), request.body.status, err => {
            if (err) {
                response.status(404).json({ message: "No existe la partida" });
            } else {
                let lastPlayer = (status.turno === 0 ? 3 : status.turno - 1);
                request.daoJuegos.setHistorial(status.players[lastPlayer].info, Number(request.params.id), status.ultimaJugada.texto, err2 => {
                    if (err2) {
                        response.status(404).json({ message: "Error al actualizar el historial" });
                    } else {
                        response.status(200).json({});
                    }
                });

            }
        });
    });

    gameController.get("/history/:id", passport.authenticate('basic', { session: false, failureRedirect: "/user/unauthorized" }), (request, response) => {
        request.daoJuegos.getHistorial(Number(request.params.id), (err, historial) => {
            if (err) {
                response.status(500).json({ message: err });
            } else if (historial.length === 0) {
                response.status(404).json({message: "No existe la partida"});
            } else {
                response.status(200).json(historial);
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
            } else if (carta % 13 === 0) {
                numero = "A"
            } else {
                numero = (carta % 13) + 1;
            }

            //Sacamos el palo
            if (Math.floor(carta / 13) === 0) {
                palo = "D";
            } else if (Math.floor(carta / 13) === 1) {
                palo = "S";
            } else if (Math.floor(carta / 13) === 2) {
                palo = "C";
            } else {
                palo = "H";
            }

            //Introducimos la carta al jugador correspondiente
            cardsPlayers[Math.floor(i / 13)].push({ numero: numero, palo: palo });
        }

        //Falta tambien asignar el turno aleatoriamente
        let turno = Math.round(Math.random() * 3); //Asi podemos aprovechar el turno como la posicion

        //Guardamos toda la informacion en la bd (cartas turno etc)
        //TODO hay que ver en cada accion si algun jugador tiene 4 cartas iguales, para que se descarte
        let gameState = {
            turno: turno,
            monton: {
                cartas: [],
                valor: null
            },
            ultimaJugada: {
                /*num: null,
                valor: null*/
                cartas: [],
                texto: null
            },
            players: [
                { info: players[0], cards: cardsPlayers[0] },
                { info: players[1], cards: cardsPlayers[1] },
                { info: players[2], cards: cardsPlayers[2] },
                { info: players[3], cards: cardsPlayers[3] },
            ]
        }

        daoJuegos.setGameState(idGame, gameState, (err) => {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

    function logThis(player, idPartida, loggableText, callback){
        request.daoJuegos.setHistorial(player, idPartida, loggableText, err => {
            if (err) {
                callback("Error al actualizar el historial", null)
            } else {
                callback(null, null);
            }
        });
    }

    return gameController;
}