module.exports = function (express, passport) {

    const userController = express.Router();

    userController.put("/new", (request, response) => {
        request.checkBody("login", "Usuario no valido").notEmptyField();
        request.checkBody("password", "Contraseña no valida").notEmptyField();
        let newUser = {
            login: request.body.login,
            password: request.body.password
        }
        request.getValidationResult().then(result => {
            if (result.isEmpty()) {
                request.daoUsuario.nuevoUsuario(newUser, (err, added) => {
                    if(err){
                        response.status(500).json({err});
                    } else if (added) {
                        response.status(201).json({});
                    } else {
                        response.status(400).json({});
                    }
                })
            } else {
                response.status(400).json({message: result.array()});
            }
        });
    });

    //Esto es para hacer el login (puedo enviarlo al menos codificado en base64?) y el passport es para autorizar las demas
    userController.post("/check", (request, response) => {
        request.checkBody("login", "Usuario no valido").notEmptyField();
        request.checkBody("password", "Contraseña no valida").notEmptyField();
        let newUser = {
            login: request.body.login,
            password: request.body.password
        }
        request.getValidationResult().then(result => {
            if (result.isEmpty()) {
                request.daoUsuario.login(newUser, (err, correct) => {
                    if(err){
                        response.status(500).json({err});
                    } else {
                        if (correct){
                            response.status(200).json({exists: true});
                        } else {
                            response.status(200).json({exists: false});
                        }
                    }
                });
            } else {
                response.status(400).json({message: result.array()});
            }
        });
    });

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