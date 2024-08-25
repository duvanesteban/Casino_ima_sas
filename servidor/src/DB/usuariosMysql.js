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
        conexion = await mysql.createConnection(dbconfig);
        console.log('Conexión a la base de datos establecida correctamente');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }

    conexion.on('error', err => {
        console.log('[db err]', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            crearConexion();
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

function buscarPorNombre(nombre) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM usuarios WHERE nombre LIKE ?`, [`%${nombre}%`], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

// Cambiar el nombre de esta función
function buscarPorIdentificacion(id) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM usuarios WHERE idUsuario = ?`, [id], (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result[0]); // Devuelve solo el primer resultado
            }
        });
    });
}

function agregar(tabla, data) {
    return new Promise((resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, [data], (error, result) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    reject(new Error("El registro ya existe en la base de datos."));
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
    return new Promise((resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE idUsuario = ?`, [data, id], (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function eliminar(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE idUsuario = ?`, [id], (error, result) => {
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

module.exports = {
    todos,
    buscarPorNombre,
    agregar,
    eliminar,
    actualizar,
    buscarPorIdentificacion, // Cambio el nombre aquí
    query
};