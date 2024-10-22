const db = require('../../DB/recibosMysql');
const ctrl = require('./controlador');

module.exports = ctrl(db);
