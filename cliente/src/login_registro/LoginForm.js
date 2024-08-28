import React, { useState } from 'react';
import axios from 'axios';
import './LoginForm.css';

function LoginForm({ onLoginSuccess }) {
    const [formData, setFormData] = useState({
        idUsuario: '',
        contrasena: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3002/usuarios/login', formData);
            console.log(response.data);
            alert('Inicio de sesión exitoso');
            onLoginSuccess();
        } catch (error) {
            alert('Error en el inicio de sesión');
            console.error('Error al iniciar sesión:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h2>Iniciar Sesión</h2>
            <div className="form-group">
                <label htmlFor="idUsuario">Usuario:</label>
                <input 
                    type="text" 
                    id="idUsuario" 
                    name="idUsuario" 
                    value={formData.idUsuario} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="contrasena">Contraseña:</label>
                <input 
                    type="password" 
                    id="contrasena" 
                    name="contrasena" 
                    value={formData.contrasena} 
                    onChange={handleChange} 
                    required 
                />
            </div>
            <button type="submit">Iniciar Sesión</button>
        </form>
    );
}

export default LoginForm;
