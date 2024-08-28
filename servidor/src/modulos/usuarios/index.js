const db = require('../../DB/usuariosMysql');
const ctrl = require('./controlador');

module.exports = ctrl(db);