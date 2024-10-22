const TABLA = 'tablaintermediaproductorecibo';

module.exports = function(dbInyectada) {
    let db = dbInyectada;
    if (!db) {
        db = require('../../DB/tablaintermediaproductorecibo.js');
    }

    async function agregar(datos) {
        const { idRecibo } = datos[0];
        const recibo = await db.query('recibo', { idRecibo });
        if (!recibo.length) {
            return { status: 400, mensaje: 'Recibo no encontrado' };
        }

        return await db.agregar('tablaintermediaproductorecibo', datos);
    }
    
    

    function todos() {
        return db.todos(TABLA);
    }

    function uno(id) {
        return db.uno(TABLA, id);
    }

    function eliminar(id) {
        return db.eliminar(TABLA, id);
    }

    return {
        todos,
        uno,
        agregar,
        eliminar
    };
};
