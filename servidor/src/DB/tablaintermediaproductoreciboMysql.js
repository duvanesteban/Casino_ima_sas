const mysql = require('mysql');
const config = require('../config');

const dbconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
};

let conexion;

function conMysql() {
    conexion = mysql.createConnection(dbconfig);

    conexion.connect((err) => {
        if (err) {
            console.log('[db err]', err);
            setTimeout(conMysql, 200);
        } else {
            console.log('Connected to MySQL database');
        }
    });

    conexion.on('error', err => {
        console.log('[db err]', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            conMysql();
        } else {
            throw err;
        }
    });
}

conMysql();

function todos(tabla) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                ti.idTablaIntermediaProductoRecibo, 
                ti.idRecibo,
                ti.idProducto, 
                p.nombreProducto,
                ti.cantidadProductosComprados, 
                ti.totalCantidadPorPrecio 
            FROM ${tabla} ti
            JOIN productos p ON ti.idProducto = p.idProducto;
        `;

        conexion.query(query, (error, result) => {
            if (error) {
                console.error('Error en la consulta:', error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}




function uno(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE idTablaIntermediaProductoRecibo = ?`, id, (error, result) => {
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
        if (!Array.isArray(data)) {
            reject(new Error('Los datos deben ser un array'));
            return;
        }

        const insertQueries = data.map(item => {
            return new Promise((resolve, reject) => {
                conexion.query(`INSERT INTO ${tabla} SET ?`, item, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        });

        Promise.all(insertQueries)
            .then(results => resolve(results))
            .catch(error => reject(error));
    });
}


function eliminar(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE idTablaIntermediaProductoRecibo = ?`, id, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

function query(tabla, condicion) {
    return new Promise((resolve, reject) => {
        let queryStr = `SELECT * FROM ${tabla} WHERE ?`;
        conexion.query(queryStr, condicion, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
    query
};
