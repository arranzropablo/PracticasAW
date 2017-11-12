const mysql = require("mysql");

let pool = mysql.createPool({
    host: "91.121.109.58",
    user: "usuariop1",
    password: "accesop1",
    database: "practica1"
});

let usuario = {
    email: "alber@gmail.com",
    nombre: "Alberto Camino Sáez",
    contraseña: "prueba",
    sexo: "H",
    fecha_nacimiento: '1996-04-19',
    imagen_perfil: 'imagen.jpg'
};

nuevoUsuario(usuario, x => { console.log(x) });

/**
 * Funcion que añade un nuevo usuario a la base de datos
 * @param {Usuario} usuario Usuario nuevo que va a ser introducido en la base de datos
 * @param {Function} callback funcion que informa del proceso
 */
function nuevoUsuario(usuario, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(`Error al obtener la conexión: ${err.message}`);
        } else {
            connection.query(
                "INSERT INTO usuarios values('" + usuario.email + "','" + usuario.nombre + "','" + usuario.contraseña +
                "','" + usuario.sexo + "','" + usuario.fecha_nacimiento + "','" + usuario.imagen_perfil + "')",
                (err, filas) => {
                    if (!err) callback("Añadido nuevo usuario");
                    else callback("No se puede añadir el usuario");
                }
            );
            connection.release();
        }

    });
}