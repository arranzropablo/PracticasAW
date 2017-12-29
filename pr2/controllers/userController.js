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
                        response.json(500, {message: new Object()});
                    } else if (added) {
                        response.json(201, {message: new Object()});
                    } else {
                        response.json(400, {message: new Object()});
                    }
                })
            } else {
                response.json(400, {message: result.array()});
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
                        response.json(500, {message: new Object()});
                    } else {
                        if (correct){
                            response.json(200, {message: {exists: true}});
                        } else {
                            response.json(200, {message: {exists: false}});
                        }
                    }
                });
            } else {
                response.json(400, {message: result.array()});
            }
        });
    });

    //TIENE QUE ESTAR IDENTIFICADA CON AUTHORIZATION, SINO 403 (Como hago para qe de un 403 desde el passport?)
    userController.get("/games/:id", (request, response) => {
        request.params.id;
        //busca en bd las partidas del usuario y las guarda en un array
        let listaPartidas = [];
        //si no hay error
        response.status(200);
        response.json(JSON.stringify(listaPartidas));
        //si hay error
        response.status(500);
        response.json(JSON.stringify(new Object()));
    });

    return userController;
}