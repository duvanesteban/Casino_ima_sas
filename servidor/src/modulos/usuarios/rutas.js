const express = require("express");
const respuesta = require("../../red/respuestas");
const controlador = require("./index");

const router = express.Router();

router.get("/", todos);
router.get("/buscarPorIdentificacion/:idUsuario", buscarPorIdentificacion);
router.get("/buscarPorNombre/:nombre", buscarPorNombre);  // Nueva ruta para buscar por nombre
router.post("/", agregar);
router.post("/login", login);
router.put("/:idUsuario", actualizar);
router.delete("/:idUsuario", eliminar);

async function todos(req, res, next) {
  try {
    const items = await controlador.todos();
    respuesta.success(req, res, items, 200);
  } catch (err) {
    next(err);
  }
}

async function buscarPorIdentificacion(req, res, next) {
  try {
    const items = await controlador.buscarPorIdentificacion(req.params.idUsuario);
    respuesta.success(req, res, items, 200);
  } catch (err) {
    next(err);
  }
}

// Nueva función para manejar la búsqueda por nombre
async function buscarPorNombre(req, res, next) {
  try {
    const items = await controlador.buscarPorNombre(req.params.nombre);
    respuesta.success(req, res, items, 200);
  } catch (err) {
    next(err);
  }
}

async function agregar(req, res, next) {
  try {
    console.log('Datos recibidos:', req.body);
    const { idUsuario, nombre, cargo, rol, contrasena } = req.body;

    if (!idUsuario) {
      return respuesta.error(req, res, 'El campo idUsuario es obligatorio', 400);
    }

    const rolesPermitidos = ["admin", "tesoreria", "cajero"];
    if (!rolesPermitidos.includes(rol)) {
      return respuesta.error(req, res, `Rol inválido. Debe ser uno de los siguientes: ${rolesPermitidos.join(", ")}`, 400);
    }

    const items = await controlador.agregar({ idUsuario, nombre, cargo, rol, contrasena });
    respuesta.success(req, res, "Usuario agregado con éxito", 201);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const idUsuario = req.params.idUsuario;
    const { nombre, cargo, rol, contrasena } = req.body;

    const rolesPermitidos = ["admin", "tesoreria", "cajero"];
    if (rol && !rolesPermitidos.includes(rol)) {
      return respuesta.error(req, res, `Rol inválido. Debe ser uno de los siguientes: ${rolesPermitidos.join(",")}`, 400);
    }

    const items = await controlador.actualizar(idUsuario, { nombre, cargo, rol, contrasena });
    respuesta.success(req, res, "Usuario actualizado con éxito", 200);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    const idUsuario = req.params.idUsuario;
    const items = await controlador.eliminar(idUsuario);
    respuesta.success(req, res, "Usuario eliminado con éxito", 200);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { idUsuario, contrasena } = req.body;

    if (!idUsuario || !contrasena) {
      return respuesta.error(req, res, 'Usuario y contraseña son obligatorios', 400);
    }

    const { token, usuario } = await controlador.iniciarSesion({ idUsuario, contrasena });

    respuesta.success(req, res, { token, usuario }, 200);
  } catch (err) {
    respuesta.error(req, res, 'Credenciales inválidas', 401);
    next(err);
  }
}

module.exports = router;
