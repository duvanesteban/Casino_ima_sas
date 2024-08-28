const mysql = require('mysql');
const config = require('../config');

const dbconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
};

let conexion;

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

crearConexion();

function todos(tabla) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function buscarPorNombre(nombreProducto) {
    return new Promise((resolve, reject) => {
        // Usar el operador LIKE con comodines para buscar coincidencias parciales
        const query = `SELECT * FROM productos WHERE nombreProducto LIKE ?`;
        const searchTerm = `%${nombreProducto}%`;

        conexion.query(query, [searchTerm], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function buscarPorIdProducto(id) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM productos WHERE idProducto = ?`, [id], (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

function agregar(tabla, data) {
    return new Promise((resolve, reject) => {
        // Asegurarse de que 'data' sea un array
        const productosArray = Array.isArray(data) ? data : [data];
        
        const query = `INSERT INTO ${tabla} (idProducto, nombreProducto, valorUnitario, estado, tipo) VALUES ?`;
        const values = productosArray.map(producto => [
            producto.idProducto,
            producto.nombreProducto,
            producto.valorUnitario,
            producto.estado,
            producto.tipo
        ]);

        conexion.query(query, [values], (error, result) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    reject(new Error("Uno o más registros ya existen en la base de datos."));
                } else {
                    reject(error);
                }
            } else {
                resolve(result);
            }
        });
    });
}



function actualizar(tabla, id, data) {
    return new Promise(async (resolve, reject) => {
        try {
            // Obtener el producto actual desde la base de datos
            const productoActual = await buscarPorIdProducto(id);
            if (!productoActual.length) {
                return reject(new Error('Producto no encontrado.'));
            }

            const productoExistente = productoActual[0];

            // Verificar si el nombre o el tipo han cambiado
            if (data.nombreProducto !== productoExistente.nombreProducto || data.tipo !== productoExistente.tipo) {
                // Verificar si ya existe otro producto con el mismo nombre y tipo
                const productosConMismoNombreYTipo = await buscarPorNombreYTipo(data.nombreProducto, data.tipo);
                if (productosConMismoNombreYTipo.length > 0 && productosConMismoNombreYTipo[0].idProducto !== id) {
                    return reject(new Error(`Ya existe un producto con el nombre "${data.nombreProducto}" y tipo "${data.tipo}".`));
                }
            }

            // Si no hay conflicto, realiza la actualización
            conexion.query(`UPDATE ${tabla} SET ? WHERE idProducto = ?`, [data, id], (error, result) => {
                return error ? reject(error) : resolve(result);
            });
        } catch (error) {
            reject(error);
        }
    });
}



function eliminar(tabla, id) {
    console.log(id);
    return new Promise((resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE idProducto = ?`, [id], (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

function query(tabla, consulta) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE ?`, consulta, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

// Nueva función buscarPorEstado
function buscarPorEstado(estado) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM productos WHERE estado = ?`, [estado], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}
// Nueva función buscarPorTipo
function buscarPorTipo(tipo) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM productos WHERE tipo = ?`, [tipo], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function eliminarMultiples(ids) {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM productos WHERE idProducto IN (?)`;
        conexion.query(query, [ids], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function buscarConFiltros(filtros) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM productos WHERE 1=1`; // La condición `1=1` es siempre verdadera, lo que permite agregar condiciones dinámicas
        const queryParams = [];

        if (filtros.idProducto) {
            query += ` AND idProducto = ?`;
            queryParams.push(filtros.idProducto);
        }
        if (filtros.nombreProducto) {
            query += ` AND nombreProducto LIKE ?`;
            queryParams.push(`%${filtros.nombreProducto}%`);
        }
        if (filtros.tipo) {
            query += ` AND tipo = ?`;
            queryParams.push(filtros.tipo);
        }
        if (filtros.estado) {
            query += ` AND estado = ?`;
            queryParams.push(filtros.estado);
        }

        conexion.query(query, queryParams, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function buscarPorNombreYTipo(nombreProducto, tipo) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM productos WHERE nombreProducto = ? AND tipo = ?`;
        conexion.query(query, [nombreProducto, tipo], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}


module.exports = {
    todos,
    buscarPorNombre,
    agregar,
    eliminar,
    actualizar,
    buscarPorIdProducto,
    buscarPorEstado,
    buscarPorTipo,
    eliminarMultiples,
    buscarConFiltros,
    buscarPorNombreYTipo,
    query
};

