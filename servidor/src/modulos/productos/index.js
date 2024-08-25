const db = require('../../DB/productosMysql');
const ctrl = require('./controlador');

module.exports = ctrl(db);