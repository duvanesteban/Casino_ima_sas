const mysql = require('mysql2/promise');
const config = require('../config');

const dbconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
};

let conexion; // Variable global para la conexión

async function crearConexion() {
    try {
        conexion = await mysql.createConnection(dbconfig); // Asigna la conexión a la variable global
        console.log('Conexión a la base de datos establecida correctamente');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }

    // Manejo de eventos después de que se establezca la conexión
    conexion.on('error', err => {
        console.log('[db err]', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            crearConexion(); // Vuelve a intentar conectarse
        } else {
            throw err;
        }
    });
}

crearConexion(); // Inicializa la conexión


// Función para agregar recibo y productos en tabla intermedia
async function agregarReciboYProductos(reciboData) {
    console.log("esto es lo que me está llegando al MYSQL.JS",reciboData);

    try {
        await crearConexion(); // Asegura la conexión

        const { valorTotal, montoPagado, cambio, idUsuario, cant, productos } = reciboData;

        // Insertar recibo
        const insertReciboQuery = 'INSERT INTO recibo (valorTotal, montoPagado, cambio, idUsuario, cant) VALUES (?, ?, ?, ?, ?)';
        const [insertReciboResult] = await conexion.execute(insertReciboQuery, [valorTotal, montoPagado, cambio, idUsuario, cant]);

        const idRecibo = insertReciboResult.insertId;
        console.log('ID del recibo insertado:', idRecibo);

        // Insertar productos en tabla intermedia
        for (const producto of productos) {
            const { idProducto, cantidadProductosComprados, totalCantidadPorPrecio } = producto;
            const insertProductoQuery = 'INSERT INTO tablaintermediaproductorecibo (idRecibo, idProducto, cantidadProductosComprados, totalCantidadPorPrecio) VALUES (?, ?, ?, ?)';
            await conexion.execute(insertProductoQuery, [idRecibo, idProducto, cantidadProductosComprados, totalCantidadPorPrecio]);
        }

        await conexion.end();

        return 'Recibo y productos agregados correctamente';
    } catch (error) {
        throw new Error('Error al agregar recibo y productos: ' + error.message);
    }
}


// Otras funciones: buscar por ID, eliminar, etc.

async function todos() {
    try {
        await crearConexion();
        const selectRecibosQuery = 'SELECT * FROM recibo';
        const [recibos] = await conexion.execute(selectRecibosQuery);
        await conexion.end();
        return recibos;
    } catch (error) {
        throw new Error('Error al obtener todos los recibos: ' + error.message);
    }
}

function buscarPorId(idRecibo) {
    return new Promise(async (resolve, reject) => {
        try {
            await crearConexion();
            const selectReciboQuery = 'SELECT * FROM recibo WHERE idRecibo = ?';
            const [recibo] = await conexion.execute(selectReciboQuery, [idRecibo]);

            const selectProductosQuery = 'SELECT * FROM tablaintermediaproductorecibo WHERE idRecibo = ?';
            const [productos] = await conexion.execute(selectProductosQuery, [idRecibo]);

            await conexion.end();
            resolve({ recibo: recibo[0], productos });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    agregarReciboYProductos,
    todos,
    buscarPorId,
    // Otras funciones como eliminar, actualizar...
};
