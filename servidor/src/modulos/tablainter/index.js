const db = require('../../DB/tablaintermediaproductoreciboMysql');
const ctrl = require('./controlador');

module.exports = ctrl(db);
