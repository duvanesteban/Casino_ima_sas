const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index.js');
const chequearAuth = require('../usuarios/seguridad'); // Importa el middleware correctamente

const router = express.Router();

// Asegúrate de que la función 'buscarPorId' esté definida antes de usarse
async function buscarPorId(req, res, next) {
    try {
        const item = await controlador.buscarPorId(req.params.idRecibo);
        respuesta.success(req, res, item, 200);
    } catch (err) {
        next(err);
    }
}

// Definición de las otras rutas
router.get('/', chequearAuth(), (req, res) => {
    console.log('Usuario en la ruta recibos:', req.usuario);  // Verifica si el usuario se está pasando correctamente
    todos(req, res);
});
router.get('/:idRecibo', chequearAuth(), buscarPorId); // Ahora buscarPorId está definida
router.post('/', chequearAuth(), agregar);
router.put('/:idRecibo', chequearAuth(), actualizar);
router.delete('/:idRecibo', chequearAuth(), eliminar);

async function todos(req, res, next) {
    try {
        const items = await controlador.todos();

        // Formatear las fechas antes de enviar la respuesta
        const itemsFormateados = items.map(item => {
            const fecha = new Date(item.fechaHoraRecibo);
            
            // Formatear la fecha en "YYYY/MM/DD" y la hora en formato AM/PM
            const fechaFormateada = `${fecha.getFullYear()}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${String(fecha.getDate()).padStart(2, '0')}`;
            const horaFormateada = fecha.toLocaleString('es-ES', {
                timeZone: 'America/Bogota',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true // Formato AM/PM
            });

            return {
                ...item,
                fechaHoraRecibo: `${fechaFormateada}, ${horaFormateada}`
            };
        });

        respuesta.success(req, res, itemsFormateados, 200);
    } catch (err) {
        next(err);
    }
}




async function agregar(req, res, next) {
    console.log('Body recibido:', req.body);
    console.log('Usuario en el token:', req.usuario);
    try {
        // Extraer los valores del objeto "recibo" dentro de req.body
        const { valorTotal, montoPagado, cambio, cant } = req.body.recibo;
        const productos = req.body.productos;
        const idUsuario = req.usuario?.idUsuario || req.usuario?.sub; // Asegúrate de que `idUsuario` esté en el token

        // Crear una lista de errores para los campos faltantes
        const camposFaltantes = [];

        if (!valorTotal) camposFaltantes.push('valorTotal');
        if (montoPagado === undefined || montoPagado === null) camposFaltantes.push('montoPagado'); // Permitir 0 como valor válid
        if (!cambio) camposFaltantes.push('cambio');
        if (!idUsuario) camposFaltantes.push('idUsuario (proveniente del token)');
        if (!cant) camposFaltantes.push('cant');
        if (!productos || productos.length === 0) camposFaltantes.push('productos');

        // Si hay campos faltantes, devolver un mensaje de error detallado
        if (camposFaltantes.length > 0) {
            return respuesta.error(req, res, `Datos incompletos: Faltan los siguientes campos: ${camposFaltantes.join(', ')}`, 400);
        }

        // Crear los datos del recibo con los valores validados
        const datosRecibo = {
            valorTotal,
            montoPagado,
            cambio,
            idUsuario, // Usar el idUsuario del token
            cant,
            productos
        };

        await controlador.agregar(datosRecibo);
        respuesta.success(req, res, 'Recibo guardado con éxito', 201);
    } catch (err) {
        next(err);
    }
}





async function actualizar(req, res, next) {
    try {
        const items = await controlador.actualizar(req.params.idRecibo, req.body);
        respuesta.success(req, res, 'Recibo actualizado con éxito', 200);
    } catch (err) {
        next(err);
    }
}

async function eliminar(req, res, next) {
    try {
        await controlador.eliminar(req.params.idRecibo);
        respuesta.success(req, res, 'Recibo eliminado con éxito', 200);
    } catch (err) {
        next(err);
    }
}

module.exports = router;
