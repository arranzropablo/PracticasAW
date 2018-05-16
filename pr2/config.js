"use strict";

/* Este módulo contiene las opciones de configuración
   de la base de datos.
 */


module.exports = {

    // Ordenador que ejecuta el SGBD
    dbHost: "localhost",

    // Usuario que accede a la BD
    dbUser: "root",

    // Contraseña con la que se accede a la BD
    dbPassword: "",

    // Nombre de la base de datos
    dbName: "practica1",

    // Puerto donde escucha la aplicacion
    port: 3000,

    // Puerto donde se escucha por https
    httpsPort: 3443,

    // Fichero con la clave privada
    private_key: "clave_aw.pem",

    // Fichero con el certificado
    certificate: "certificado_aw_firmado.crt"

}