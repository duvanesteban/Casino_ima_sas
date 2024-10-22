const auth = require("../../auth");

function chequearAuth() {
    return function (req, res, next) {
        try {
            const usuarioAutenticado = auth.chequearToken.confirmarToken(req);
            console.log('Usuario autenticado:', usuarioAutenticado);  // Verifica si el usuario autenticado es correcto
            req.usuario = usuarioAutenticado; // Guardar los datos del usuario autenticado
            next(); // Continuar al siguiente middleware
        } catch (error) {
            console.error('Error de autenticación:', error.message);  // Agregar un log para errores de autenticación
            res.status(401).json({ error: 'Acceso no autorizado' });
        }
    };
}

module.exports = chequearAuth;
