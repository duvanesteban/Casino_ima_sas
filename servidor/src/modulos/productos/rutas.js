const express = require('express');
const path = require('path');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');
const db = require('../../DB/productosMysql');

const app = express();

// Rutas para manejar las solicitudes relacionadas con los productos
app.get('/', todos);
app.get('/:nombreProducto', buscarPorNombre);
app.get('/idProducto/:id', buscarPorIdProducto);
app.post('/',agregar); // Usar multer para manejar la carga de imágenes
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
    const productos = await db.buscarPorNombre(nombreProducto);
    respuesta.success(req, res, productos, 200);
  } catch (err) {
    next(err);
  }
}
async function buscarPorIdProducto(req, res, next) {
    try {
      const id = req.params.id;
      const producto = await db.buscarPorIdProducto(id);
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
        if (err.message && err.message.includes("ya existe")) {
            respuesta.error(req, res, err.message, 400);
        } else {
            respuesta.error(req, res, "Error interno del servidor", 500);
        }
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
    // Obtener el ID del producto desde los parámetros de la ruta
    const idProducto = req.params.idProducto;

    // Llamar al método del controlador para eliminar el elemento
    await controlador.eliminar(idProducto);

    // Enviar una respuesta de éxito
    respuesta.success(req, res, 'Elemento eliminado con éxito', 200);
  } catch (err) {
    // Pasar el control al siguiente middleware de manejo de errores
    next(err);
  }
}

async function buscarPorEstado(req, res, next) {
  try {
    const estado = req.params.estado; // Obtener el estado desde los parámetros de la ruta
    
    // Llamar al método del controlador para buscar productos por estado
    const productos = await db.buscarPorEstado(estado);
    
    // Verificar si se encontraron productos
    if (productos.length > 0) {
      respuesta.success(req, res, productos, 200);
    } else {
      respuesta.error(req, res, 'No se encontraron productos con el estado especificado', 404);
    }
  } catch (err) {
    next(err); // Pasar cualquier error al siguiente middleware
  }
}

// Nueva función para buscar productos por tipo
async function buscarPorTipo(req, res, next) {
  try {
    const tipo = req.params.tipo; // Obtener el tipo desde los parámetros de la ruta
    
    // Llamar al método del controlador para buscar productos por tipo
    const productos = await db.buscarPorTipo(tipo);
    
    // Verificar si se encontraron productos
    if (productos.length > 0) {
      respuesta.success(req, res, productos, 200);
    } else {
      respuesta.error(req, res, 'No se encontraron productos con el tipo especificado', 404);
    }
  } catch (err) {
    next(err); // Pasar cualquier error al siguiente middleware
  }
}

async function eliminarMultiples(req, res, next) {
  try {
      const { ids } = req.body;
      await controlador.eliminarMultiples(ids);
      respuesta.success(req, res, 'Productos eliminados con éxito', 200);
  } catch (err) {
      next(err);
  }
}


module.exports = app;