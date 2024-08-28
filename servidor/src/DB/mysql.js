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
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

function uno(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE id = ?`, id, (error, result) => {
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
        // Verifica si los datos son un array o un objeto
        if (!Array.isArray(data)) {
            data = [data]; // Convertir el objeto en un array con un solo elemento
        }

        const insertQueries = data.map(producto => {
            return new Promise((resolve, reject) => {
                // Inserta cada producto en la base de datos
                conexion.query(`INSERT INTO ${tabla} SET ?`, producto, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        });

        // Ejecutar todas las consultas de inserción
        Promise.all(insertQueries)
            .then(results => resolve(results))
            .catch(error => reject(error));
    });
}


function actualizar(tabla, data) {
    return new Promise((resolve, reject) => {
        const { id, ...updateData } = data;
        conexion.query(`UPDATE ${tabla} SET ? WHERE id = ?`, [updateData, id], (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

function eliminar(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE id = ?`, id, (error, result) => {
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
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}



module.exports = {
    todos,
    uno,
    agregar,
    actualizar,
    eliminar,
    query
};