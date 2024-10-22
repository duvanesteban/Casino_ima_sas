const TABLA = 'usuarios';
const bcrypt = require('bcrypt'); // Asegúrate de tener bcrypt requerido
const auth = require('../../auth'); // Importar la función asignarToken desde auth

module.exports = function(dbInyectada) {
    let db = dbInyectada;
    if (!db) {
        db = require('../../DB/usuariosMysql');
    }

    function todos() {
        return db.todos(TABLA);
    }

    function buscarPorIdentificacion(idUsuario) {
        return db.buscarPorIdentificacion(idUsuario);
    }

    function buscarPorNombre(nombre) {
        return db.buscarPorNombre(nombre);
    }

    function validarContrasena(contrasena) {
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        return regex.test(contrasena);
    }

    async function agregar(body) {
        try {
            const { idUsuario, nombre, cargo, rol, contrasena } = body;
    
            // Validar la contraseña antes de proceder
            if (!validarContrasena(contrasena)) {
                throw {
                    status: 400,
                    message: 'La contraseña no cumple con los requisitos de seguridad. Debe tener: Mínimo 8 caracteres, al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.'
                };
            }
            
            const hashedPassword = await bcrypt.hash(contrasena, 10); // Hash de la contraseña
    
            const usuarioData = {
                idUsuario,
                nombre,
                cargo,
                rol,
                contrasena: hashedPassword
            };
    
            const respuesta = await db.agregar(TABLA, usuarioData);
            let insertId = 0;
            if (body.idUsuario == 0) {
                insertId = respuesta.insertId;
            } else {
                insertId = body.idUsuario;
            }
    
            return { insertId, ...usuarioData };
    
        } catch (error) {
            if (error.status) {
                throw error;
            } else {
                throw {
                    status: 500,
                    message: 'Error al agregar el usuario en la base de datos.'
                };
            }
        }
    }

    async function iniciarSesion({ idUsuario, contrasena }) {
        const user = await db.buscarPorIdentificacion(idUsuario);

        console.log('este es el usuario',user); // Verifica si user tiene el campo idUsuario

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const match = await bcrypt.compare(contrasena, user.contrasena);
        if (!match) {
            throw new Error('Contraseña incorrecta');
        }

        // Aquí usas la función asignarToken de auth en lugar de generar el token directamente
        const token = auth.asignarToken(user);

        return { token, usuario: user };
    }

    function eliminar(idUsuario) {
        return db.eliminar(TABLA, idUsuario);
    }

    return {
        todos,
        buscarPorIdentificacion,
        buscarPorNombre,
        agregar,
        eliminar,
        iniciarSesion
    };
}
