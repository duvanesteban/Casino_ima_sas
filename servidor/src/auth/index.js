const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config');

const secret = config.jwt.secret;

// Generar token JWT
function asignarToken(data) {
    const payload = {
        sub: data.idUsuario,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.sign(payload, secret);
}

function verificarToken(token) {
    return jwt.verify(token, secret);
}

const chequearToken = {
    confirmarToken: function(req) {
        const decodificado = decodificarCabecera(req);

        if (decodificado.idUsuario !== req.body.idUsuario) {
            throw new Error("No tienes privilegios para hacer esto");
        }
    }
};

function obtenerToken(autorizacion) {
    if (!autorizacion) {
        throw new Error('No viene token');
    }
    if (autorizacion.indexOf('Bearer') === -1) {
        throw new Error('Formato invalido');
    }

    let token = autorizacion.replace('Bearer ', '');
    return token;
}

function decodificarCabecera(req) {
    const autorizacion = req.headers.authorization || '';
    const token = obtenerToken(autorizacion);
    const decodificado = verificarToken(token);

    req.user = decodificado;
    return decodificado;
}

module.exports = {
    asignarToken,
    chequearToken
};