const express = require('express');
const path = require('path');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');

const app = express();

// Rutas para manejar las solicitudes relacionadas con los productos
app.get('/', todos);
app.get('/:nombreProducto', buscarPorNombre);
app.get('/idProducto/:id', buscarPorIdProducto);
app.post('/', agregar); 
app.put('/:idProducto', actualizar);
app.delete('/:idProducto', eliminar);
app.post('/eliminar-multiples', eliminarMultiples);

async function todos(req, res, next) {
    try {
        const filtros = {
            idProducto: req.query.idProducto,
            nombreProducto: req.query.nombreProducto,
            tipo: req.query.tipo,
            estado: req.query.estado
        };
        
        const productos = await controlador.buscarConFiltros(filtros);
        respuesta.success(req, res, productos, 200);
    } catch (err) {
        next(err);
    }
}

async function buscarPorNombre(req, res, next) {
    try {
        const nombreProducto = req.params.nombreProducto;
        const productos = await controlador.buscarPorNombre(nombreProducto);
        respuesta.success(req, res, productos, 200);
    } catch (err) {
        next(err);
    }
}

async function buscarPorIdProducto(req, res, next) {
    try {
        const id = req.params.id;
        const producto = await controlador.buscarPorIdProducto(id);
        if (producto.length > 0) {
            respuesta.success(req, res, producto, 200);
        } else {
            respuesta.error(req, res, 'Producto no encontrado', 404);
        }
    } catch (err) {
        next(err);
    }
}

async function agregar(req, res, next) {
    try {
        const productos = Array.isArray(req.body) ? req.body : [req.body];
        
        const resultado = await controlador.agregar(productos);
        respuesta.success(req, res, resultado, 201);
    } catch (err) {
        console.error("Error en la solicitud de agregar productos:", err);
        respuesta.error(req, res, "Error interno del servidor", 500);
    }
}

async function actualizar(req, res, next) {
    try {
        const idProducto = req.params.idProducto;
        const { nombreProducto, valorUnitario, estado, tipo } = req.body;

        // Validar que los campos 'estado' y 'tipo' tengan valores permitidos
        const estadosPermitidos = ['Activo', 'Inactivo'];
        const tiposPermitidos = ['Preparado', 'Comprado'];

        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).send('Valor de estado no permitido. Debe ser "Activo" o "Inactivo".');
        }

        if (!tiposPermitidos.includes(tipo)) {
            return res.status(400).send('Valor de tipo no permitido. Debe ser "Preparado" o "Comprado".');
        }

        // Intentar actualizar el producto
        await controlador.actualizar(idProducto, { nombreProducto, valorUnitario, estado, tipo });

        // Si se actualiza exitosamente
        respuesta.success(req, res, 'Producto actualizado con éxito', 200);
    } catch (err) {
        if (err.message && err.message.includes("Ya existe un producto con el nombre")) {
            respuesta.error(req, res, err.message, 400);
        } else {
            respuesta.error(req, res, "Error interno del servidor", 500);
        }
    }
}

async function eliminar(req, res, next) {
    try {
        const idProducto = req.params.idProducto;

        await controlador.eliminar(idProducto);
        respuesta.success(req, res, 'Elemento eliminado con éxito', 200);
    } catch (err) {
        next(err);
    }
}

async function buscarPorEstado(req, res, next) {
    try {
        const estado = req.params.estado; 
        const productos = await controlador.buscarPorEstado(estado);
        
        if (productos.length > 0) {
            respuesta.success(req, res, productos, 200);
        } else {
            respuesta.error(req, res, 'No se encontraron productos con el estado especificado', 404);
        }
    } catch (err) {
        next(err);
    }
}

async function buscarPorTipo(req, res, next) {
    try {
        const tipo = req.params.tipo; 
        const productos = await controlador.buscarPorTipo(tipo);
        
        if (productos.length > 0) {
            respuesta.success(req, res, productos, 200);
        } else {
            respuesta.error(req, res, 'No se encontraron productos con el tipo especificado', 404);
        }
    } catch (err) {
        next(err);
    }
}

async function eliminarMultiples(req, res, next) {
    try {
        const { ids } = req.body;
        await controlador.eliminarMultiples(ids);
        respuesta.success(req, res, 'Producto(s) eliminado(s) con éxito', 200);
    } catch (err) {
        next(err);
    }
}

module.exports = app;
