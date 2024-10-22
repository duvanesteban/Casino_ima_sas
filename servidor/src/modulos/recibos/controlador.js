module.exports = function(dbInyectada) {
    let db = dbInyectada;
    if (!db) {
        db = require('../../DB/recibosMysql');
    }

    function todos() {
        return db.todos();
    }

    async function agregar(datosRecibo) {
        try {
            console.log('Datos de recibo recibidos en el controlador.js:', datosRecibo);
            await db.agregarReciboYProductos(datosRecibo);
            return 'Recibo y productos agregados correctamente';
        } catch (error) {
            throw error;
        }
    }

    function buscarPorId(idRecibo) {
        return db.buscarPorId(idRecibo);
    }

    function actualizar(idRecibo, data) {
        return db.actualizar(idRecibo, data);
    }

    function eliminar(idRecibo) {
        return db.eliminar(idRecibo);
    }

    return {
        todos,
        agregar,
        buscarPorId,
        actualizar,
        eliminar,
    };
};
