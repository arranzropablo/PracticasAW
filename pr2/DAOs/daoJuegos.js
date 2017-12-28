class DaoJuegos {

    /**
     * Constructor del DAO
     * @param {Pool} pool recibe un objeto pool para gestionar las conexiones
     */
    constructor(pool) {
        this.pool = pool;
    }
}

module.exports = {
    DaoJuegos: DaoJuegos
}