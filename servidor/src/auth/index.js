const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config');

const secret = config.jwt.secret;
console.log('Secreto usado para JWT:', secret);

function asignarToken(data) {
    const payload = {
        idUsuario: data.IdUsuario,        // ID del usuario
        nombreUsuario: data.nombre, // Nombre del usuario
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()  // Expiración en 14 días
    };

    // Generar el token
    const token = jwt.sign(payload, secret);

    return token;  // Devolver el token generado
}



function verificarToken(token) {
    console.log('Verificando token:', token);  // Log para verificar el token
    return jwt.verify(token, secret);
}

const chequearToken = {
    confirmarToken: function (req) {
        const decodificado = decodificarCabecera(req);
        return decodificado; // Retorna el token decodificado
    }
};

function obtenerToken(autorizacion) {
    if (!autorizacion) {
        throw new Error('No viene token');
    }
    if (autorizacion.indexOf('Bearer') === -1) {
        throw new Error('Formato inválido');
    }

    let token = autorizacion.replace('Bearer ', '');
    return token;
}

function decodificarCabecera(req) {
    const autorizacion = req.headers.authorization || '';
    const token = obtenerToken(autorizacion);
    const decodificado = verificarToken(token);

    req.user = decodificado; // Almacenar los datos del usuario en la request
    return decodificado;
}

module.exports = {
    asignarToken,
    chequearToken
};
