import React, { useState } from 'react';
import axios from 'axios';
import './RegisterForm.css';

function RegisterForm() {
    const [form, setForm] = useState({
        idUsuario: '',
        nombre: '',
        cargo: '',
        rol: '',
        contrasena: ''
    });

    const [showPasswordHint, setShowPasswordHint] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleFocus = () => {
        setShowPasswordHint(true);
    };

    const handleBlur = () => {
        setShowPasswordHint(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3002/usuarios', form);
            console.log(response.data);
            alert('Usuario registrado con éxito');

            // Vaciar los campos del formulario
            setForm({
                idUsuario: '',
                nombre: '',
                cargo: '',
                rol: '',
                contrasena: ''
            });

        } catch (error) {
            // Verificar si el error es por un duplicado
            if (error.response && error.response.data && error.response.data.error) {
                if (error.response.data.error.includes("El registro ya existe en la base de datos.")) {
                    alert("El usuario ya existe en la base de datos.");
                } else {
                    alert(error.response.data.error); // Muestra otros mensajes de error del servidor
                }
            } else {
                alert('Hubo un error al registrar el usuario');
            }
            console.error('Error al registrar el usuario:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            <h2>Registro de Usuario</h2>
            <div className="form-group">
                <label htmlFor="idUsuario">ID Usuario:</label>
                <input 
                    type="text" 
                    id="idUsuario" 
                    name="idUsuario" 
                    value={form.idUsuario} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="nombre">Nombre:</label>
                <input 
                    type="text" 
                    id="nombre" 
                    name="nombre" 
                    value={form.nombre} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="cargo">Cargo:</label>
                <input 
                    type="text" 
                    id="cargo" 
                    name="cargo" 
                    value={form.cargo} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="rol">Rol:</label>
                <select 
                    id="rol" 
                    name="rol" 
                    value={form.rol} 
                    onChange={handleChange} 
                    required 
                >
                    <option value="">Seleccione un rol</option>
                    <option value="admin">Admin</option>
                    <option value="tesoreria">Tesorería</option>
                    <option value="cajero">Cajero</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="contrasena">Contraseña:</label>
                <input 
                    type="password" 
                    id="contrasena" 
                    name="contrasena" 
                    value={form.contrasena} 
                    onChange={handleChange} 
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required
                />
                {showPasswordHint && (
                    <small className="password-hint">
                        Debe tener: Mínimo 8 caracteres, al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.
                    </small>
                )}
            </div>
            <button type="submit">Registrar</button>
        </form>
    );
}

export default RegisterForm;
