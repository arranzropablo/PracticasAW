module.exports = function(express, passport) {

    const gameController = express.Router();

    gameController.get("/status/:id", passport.authenticate('basic', { session: false, failureRedirect: "/user/unauthorized" }), (request, response) => {
        request.daoJuegos.getStatus(request.params.id, (err, status) => {
            if (err) {
                response.status(500).json({ err });
            } else if (status === null) {
                response.status(404).json({ message: "No existe la partida" });
            } else {
                let statusRetrieved = JSON.parse(status);
                if(statusRetrieved.players.length === 4) {
                    statusRetrieved.monton.cantidad = statusRetrieved.monton.cartas.length;
                    statusRetrieved.monton.cartas = [];
                    statusRetrieved.ultimaJugada.cantidad = statusRetrieved.ultimaJugada.cartas.length;
                    statusRetrieved.ultimaJugada.cartas = [];
                }
                statusRetrieved.players.forEach(player => {
                    player.cantidad = player.cards.length;
                    if (player.info.login !== request.user) {
                        player.cards = [];
                    }
                });
                response.status(200).json(statusRetrieved);
            }
        });
    });

    gameController.put("/new", passport.authenticate('basic', { session: false, failureRedirect: "/user/unauthorized" }), (request, response) => {
        request.daoJuegos.newGame(request.body.name, request.user, (err, idCreated) => {
            if (err) {
                response.status(500).json({ err });
            } else {
                logThis(idCreated, "El usuario " + request.user + " ha creado la partida y se ha unido a ella", request.daoJuegos)
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
                                logThis(Number(request.params.id), "El usuario " + user.login + " se ha unido a la partida", request.daoJuegos);
                                if (players.length + 1 === 4) {
                                    players.push(user);
                                    startGame(request.daoJuegos, players, Number(request.params.id), (err) => {
                                        if (err) {
                                            response.status(500).json(err)
                                        } else {
                                            logThis(Number(request.params.id), "Comienza la partida!", request.daoJuegos);
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
        request.daoJuegos.getStatus(request.params.id, (err, statusRetrieved) => {
            if (err) {
                response.status(500).json({err});
            } else if (statusRetrieved === null) {
                response.status(404).json({message: "No existe la partida"});
            } else {
                let status = JSON.parse(statusRetrieved)
                let action = request.body.action;
                switch (action) {
                    case "mentira":
                        let lastPlayer = (status.turno === 0 ? 3 : status.turno - 1);
                        if (status.ultimaJugada.cartas.every(carta => {
                                return carta.numero == status.monton.valor
                            })) {
                            logThis(Number(request.params.id), "El jugador " + status.players[status.turno].info.login + " piensa que " + status.players[lastPlayer].info.login + " miente, ¡pero se ha equivocado!", request.daoJuegos);

                            status.monton.cartas.forEach(carta => {
                                status.players[status.turno].cards.push(carta);
                            });

                            status.turno++;
                            if (status.turno === 4) {
                                status.turno = 0;
                            }

                            if(status.players[lastPlayer].cantidad !== 0){
                                status.winner = status.players[lastPlayer].info;
                                logThis(Number(request.params.id), "El jugador " + status.players[lastPlayer].info.login + " ha ganado", request.daoJuegos);
                            }

                        } else {
                            logThis(Number(request.params.id), "El jugador " + status.players[status.turno].info.login + " piensa que " + status.players[lastPlayer].info.login + " miente, ¡y estaba en lo cierto!", request.daoJuegos);

                            status.monton.cartas.forEach(carta => {
                                status.players[lastPlayer].cards.push(carta);
                            });
                        }
                        status.monton.cartas = [];
                        status.monton.valor = null;
                        status.ultimaJugada.cartas = [];

                        break;

                    case "jugada":
                        //Ponemos valor al monton en caso de no tener
                        if (status.monton.valor === null) {
                            //De paso, el valor del monton de cartas que meta el usuario si este es el primero que mete cartas al mismo
                            status.monton.valor = request.body.valor;
                        }
                        status.ultimaJugada.cartas = [];

                        request.body.cartas.forEach(card => {
                            status.monton.cartas.push(card);
                            status.ultimaJugada.cartas.push(card);
                            let pos = 0;
                            while (pos < status.players[status.turno].cards.length) {
                                if (card.numero === status.players[status.turno].cards[pos].numero &&
                                    card.palo === status.players[status.turno].cards[pos].palo) {
                                    break;
                                }
                                pos++;
                            }
                            status.players[status.turno].cards.splice(pos, 1)
                        });

                        //Rellenamos el texto de la ultima jugada
                        logThis(Number(request.params.id), "El jugador " + status.players[status.turno].info.login + " ha echado " + status.ultimaJugada.cartas.length + " " + status.monton.valor, request.daoJuegos);

                        //Cambiamos el turno
                        status.turno++;
                        if (status.turno === 4) {
                            status.turno = 0;
                        }

                        break;
                }
                request.daoJuegos.setGameState(Number(request.params.id), status, err => {
                    if (err) {
                        response.status(500).json({err});
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
        //TODO hay que ver en cada accion si algun jugador tiene 4 cartas iguales, para que se descarte (y logarlo) para eso puedo ordenarlas y ya
        //TODO hay que hacer que cuando hay un winner el siguiente solo le aparezca el boton de mentiroso y si lo pulsa y gana pues que ya no aparezca nada al siguiente jugador
        //TODO hacer la prueba de qe uno "gane" el siguiente diga mentiroso, y el anterior se las lleve... no se muestra el boton de jugar cartas seleccionadas
        let gameState = {
            turno: turno,
            monton: {
                cartas: [],
                valor: null
            },
            ultimaJugada: {
                cartas: [],
            },
            players: [
                { info: players[0], cards: cardsPlayers[0] },
                { info: players[1], cards: cardsPlayers[1] },
                { info: players[2], cards: cardsPlayers[2] },
                { info: players[3], cards: cardsPlayers[3] },
            ],
            winner: null
        }

        daoJuegos.setGameState(idGame, gameState, (err) => {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

    function logThis(idPartida, loggableText, dao){
        dao.setHistorial(idPartida, loggableText, err => {
            if (err) {
                //No considero el error al actualizar el historial como un error crucial para no
                //devolver un codigo http OK, por lo que de aquí no sube.
                console.log("Error al actualizar el historial");
            }
        });
    }

    return gameController;
}