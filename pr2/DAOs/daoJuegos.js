class DaoJuegos {

    /**
     * Constructor del DAO
     * @param {Pool} pool recibe un objeto pool para gestionar las conexiones
     */
    constructor(pool) {
        this.pool = pool;
    }

    getPlayers(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query(
                    "select u.login as login, u.id as id from partidas p join juega_en j on p.id = j.idPartida join usuarios u on u.id=j.idUsuario where p.id = ?", [id],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback("Error al realizar la consulta", null)
                        } else {
                            let players = [];
                            filas.forEach(fila => {
                                players.push({ login: fila.login, id: fila.id });
                            });
                            callback(null, players);
                        }
                    }
                );
            }
        });
    }

    getStatus(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query(
                    "select estado from partidas where id = ?", [id],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback("Error al realizar la consulta", null)
                        } else if (filas.length > 0) {
                            callback(null, filas[0].estado);
                        } else {
                            callback(null, null)
                        }
                    }
                );
            }
        });
    }

    newGame(nombre, user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                let gameState = {
                    players: [
                        { info: { login: user }, cards: [] },
                    ]
                }

                connection.query(
                    "insert into partidas (nombre, estado) values (?, ?)", [nombre, JSON.stringify(gameState)],
                    (err, result) => {
                        if (err) {
                            connection.release();
                            callback("Error al realizar la insercion", null)
                        } else {
                            connection.query(
                                "insert into juega_en values ((select id from usuarios where login = ?), ?)", [user, result.insertId],
                                (err, filas) => {
                                    connection.release();
                                    if (err) {
                                        callback("Error al realizar la insercion", null)
                                    } else {
                                        callback(null, true);
                                    }
                                }
                            );
                        }
                    }
                );
            }
        });
    }

    joinGame(id, user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query(
                    "insert into juega_en values ((select id from usuarios where login = ?), ?)", [user, id],
                    (err, result) => {
                        if (err) {
                            callback("El jugador ya se ha unido a esta partida", null)
                        } else {
                            connection.query("SELECT estado FROM partidas WHERE id = ?", [id], (err, filas) => {
                                connection.release();
                                if (err) {
                                    callback("Error al obtener el estado de la partida", null);
                                } else {
                                    let estado = JSON.parse(filas[0].estado);
                                    estado.players.push({ info: { login: user }, cards: [] });
                                    this.setGameState(id, estado, err => {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, true);
                                        }
                                    });
                                }
                            });
                        }
                    }
                );
            }
        });
    }

    getGames(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`, false)
            } else {
                connection.query(
                    "SELECT idPartida, nombre FROM juega_en JOIN partidas ON (id = idPartida) " +
                    "WHERE idUsuario = (SELECT usuarios.id FROM usuarios WHERE login = ?)", [user],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback("Error en la consulta", null)
                        } else {
                            let partidas = [];
                            filas.forEach(fila => {
                                partidas.push({ id: fila.idPartida, nombre: fila.nombre });
                            });
                            callback(null, partidas);
                        }
                    }
                );
            }
        });
    }

    setGameState(id, gameState, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`)
            } else {
                connection.query(
                    "UPDATE partidas SET estado = ? WHERE id = ?", [JSON.stringify(gameState), id],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback("Error en la consulta.")
                        } else {
                            callback(null);
                        }
                    }
                );
            }
        });
    }

    setHistorial(player, idPartida, evento, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`)
            } else {
                connection.query(
                    "INSERT INTO historial (id, idPartida, evento) VALUES (?, ?, ?)", [player.id, idPartida, evento],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback("Error en la inserción del historial.")
                        } else {
                            callback(null);
                        }
                    }
                );
            }
        });
    }

    getHistorial(idPartida, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(`Error al obtener la conexión: ${err.message}`)
            } else {
                connection.query(
                    "SELECT hora, evento from historial where idPartida = ?", [idPartida],
                    (err, filas) => {
                        connection.release();
                        if (err) {
                            callback("Error al recuperar el historial.", null)
                        } else {
                            let history = [];
                            filas.forEach(fila => {
                                history.push({timestamp: fila.hora, evento: fila.evento});
                            })
                            callback(null, history);
                        }
                    }
                );
            }
        });
    }
}


module.exports = {
    DaoJuegos: DaoJuegos
}