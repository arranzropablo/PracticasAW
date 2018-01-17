module.exports = function(express) {

    const authController = express.Router();

    authController.put("/register", (request, response) => {
        request.checkBody("login", "Usuario no valido").notEmptyField();
        request.checkBody("password", "Contraseña no valida").notEmptyField();
        let newUser = {
            login: request.body.login,
            password: request.body.password
        }
        request.getValidationResult().then(result => {
            if (result.isEmpty()) {
                request.daoUsuario.nuevoUsuario(newUser, (err, added) => {
                    if (err) {
                        response.status(500).json({ err });
                    } else if (added) {
                        response.status(201).json({});
                    } else {
                        response.status(400).json({ message: "El usuario ya existe" });
                    }
                })
            } else {
                response.status(400).json({ message: result.array() });
            }
        });
    });

    authController.post("/login", (request, response) => {
        request.checkBody("login", "Usuario no valido").notEmptyField();
        request.checkBody("password", "Contraseña no valida").notEmptyField();
        let newUser = {
            login: request.body.login,
            password: request.body.password
        }
        request.getValidationResult().then(result => {
            if (result.isEmpty()) {
                request.daoUsuario.login(newUser, (err, correct) => {
                    if (err) {
                        response.status(500).json({ err });
                    } else {
                        if (correct) {
                            response.status(200).json({ exists: true });
                        } else {
                            response.status(200).json({ exists: false });
                        }
                    }
                });
            } else {
                response.status(400).json({ message: result.array() });
            }
        });
    });

    return authController;
}