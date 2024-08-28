const express = require("express");
const respuesta = require("../../red/respuestas");
const controlador = require("./index"); // Debe importar desde 'index.js' para obtener el controlador

const router = express.Router();

router.get("/", todos);
router.get("/:id", uno);
router.post("/", agregar);
router.delete("/:id", eliminar);

async function todos(req, res, next) {
  try {
    const items = await controlador.todos();
    respuesta.success(req, res, items, 200);
  } catch (err) {
    next(err);
  }
}

async function uno(req, res, next) {
  try {
    const item = await controlador.uno(req.params.id);
    respuesta.success(req, res, item, 200);
  } catch (err) {
    next(err);
  }
}

async function agregar(req, res, next) {
  try {
    const resultado = await controlador.agregar(req.body);

    if (resultado.status === 400) {
        // Si el status es 400, significa que hubo un problema
        respuesta.error(req, res, resultado.mensaje, 400);
    } else if (resultado.status === 201) {
        // Si el status es 201, significa que fue creado exitosamente
        respuesta.success(req, res, resultado.mensaje, 201);
    }
  } catch (err) {
    next(err); // Manejamos otros errores
  }
}



async function eliminar(req, res, next) {
  try {
    const result = await controlador.eliminar(req.params.id);
    respuesta.success(req, res, result, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = router;