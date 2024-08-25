const auth = require("../../auth");

module.exports = function chequearAuth() {
    function middleware(req, res, next) {
        try {
            auth.chequearToken.confirmarToken(req);
            next();
        } catch (error) {
            res.status(401).json({ error: 'Acceso no autorizado' });
        }
    }
    return middleware;
}