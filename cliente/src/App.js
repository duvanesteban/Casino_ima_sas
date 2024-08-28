import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterForm from "./login_registro/RegisterForm";
import LoginForm from './login_registro/LoginForm';
import Principal from './principal/principal'; // Importa el componente Principal
import Productos from './productos/productos'; // Importa el componente Productos
import './styles.css';

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para manejar si el usuario está logueado

  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // Cambia el estado a "logueado" cuando el login sea exitoso
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          {!isLoggedIn && (
            <div className="link-container">
              <a 
                href="#" 
                onClick={() => setShowLogin(true)} 
                className={showLogin ? 'active-link' : ''}
              >
                Iniciar Sesión
              </a>
              <a 
                href="#" 
                onClick={() => setShowLogin(false)} 
                className={!showLogin ? 'active-link' : ''}
              >
                Registro
              </a>
            </div>
          )}
        </header>
        <main>
          {isLoggedIn ? (
            <Routes>
              <Route path="/principal" element={<Principal />} />
              <Route path="/productos" element={<Productos />} />
            </Routes>
          ) : (
            showLogin ? <LoginForm onLoginSuccess={handleLoginSuccess} /> : <RegisterForm />
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
