const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');

const app = express();

// Rutas para manejar las solicitudes relacionadas con la tabla intermedia
app.get('/', todos);
app.get('/:id', uno);
app.post('/', agregar);
app.put('/:idTablaIntermediaProductoRecibo', actualizar);
app.delete('/:idTablaIntermediaProductoRecibo', eliminar);
app.post('/eliminar-multiples', eliminarMultiples);

async function todos(req, res, next) {
    try {
        const registros = await controlador.todos();
        respuesta.success(req, res, registros, 200);
    } catch (err) {
        next(err);
    }
}

async function uno(req, res, next) {
    try {
        const id = req.params.id;
        const registro = await controlador.uno(id);
        if (registro.length > 0) {
            respuesta.success(req, res, registro, 200);
        } else {
            respuesta.error(req, res, 'Registro no encontrado', 404);
        }
    } catch (err) {
        next(err);
    }
}

async function agregar(req, res, next) {
    try {
        const registros = Array.isArray(req.body.productos) ? req.body.productos : [req.body.productos];
        const idRecibo = req.body.idRecibo; // Cambiado de idUsuario a idRecibo
  
        const datos = registros.map((producto) => ({
            idRecibo,  // Cambiado de idUsuario a idRecibo
            idProducto: producto.idProducto,
            cantidadProductosComprados: producto.cantidadProductosComprados,
            totalCantidadPorPrecio: producto.totalCantidadPorPrecio
        }));
  
        const resultado = await controlador.agregar(datos);
  
        respuesta.success(req, res, {
            mensaje: 'Productos agregados exitosamente.',
            productos: datos
        }, 201);
    } catch (err) {
        console.error("Error en la solicitud de agregar registros:", err);
        respuesta.error(req, res, "Error interno del servidor", 500);
    }
  }
  



async function actualizar(req, res, next) {
    try {
        const idTablaIntermediaProductoRecibo = req.params.idTablaIntermediaProductoRecibo;
        const { idUsuarios, idProducto, cantidadProductosComprados, totalCantidadPorPrecio } = req.body;

        await controlador.actualizar(idTablaIntermediaProductoRecibo, {
            idUsuarios,
            idProducto,
            cantidadProductosComprados,
            totalCantidadPorPrecio
        });

        respuesta.success(req, res, 'Registro actualizado con éxito', 200);
    } catch (err) {
        console.error("Error en la solicitud de actualizar:", err);
        respuesta.error(req, res, "Error interno del servidor", 500);
    }
}

async function eliminar(req, res, next) {
    try {
        const idTablaIntermediaProductoRecibo = req.params.idTablaIntermediaProductoRecibo;
        await controlador.eliminar(idTablaIntermediaProductoRecibo);
        respuesta.success(req, res, 'Registro eliminado con éxito', 200);
    } catch (err) {
        next(err);
    }
}

async function eliminarMultiples(req, res, next) {
    try {
        const { ids } = req.body;
        await controlador.eliminarMultiples(ids);
        respuesta.success(req, res, 'Registros eliminados con éxito', 200);
    } catch (err) {
        next(err);
    }
}

module.exports = app;
