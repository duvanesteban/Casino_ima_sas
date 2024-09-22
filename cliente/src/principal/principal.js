import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './principal.css';

function Principal() {
    const navigate = useNavigate();
    const [valorRecibido, setValorRecibido] = useState(0);
    const [total, setTotal] = useState(500.00); // Valor total para demostración
    const [cambio, setCambio] = useState(0);
    const [numeroRecibo, setNumeroRecibo] = useState(1); // Inicializar el número de recibo
    const [cantidad, setCantidad] = useState(1); // Nuevo estado para la cantidad

    const handleCambio = (e) => {
        const valor = parseFloat(e.target.value) || 0;
        setValorRecibido(valor);
        setCambio(valor - total);
    };

    const handleNavigateToProductos = () => {
        navigate('/productos'); // Navega a la ruta /productos
    };

    return (
        <div className="principal-container">
            
             

            <div className="left-panel">
                <h1>CASINO IMASAS</h1>
                <form>
                    <div className="form-group">
                        <label htmlFor="codigo">Codigo</label>
                        <input type="text" id="codigo" />
                    </div>
                    <div className="form-group large-input">
                        <label htmlFor="producto">Producto</label>
                        <input type="text" id="producto" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <input type="text" id="descripcion" />
                    </div>
                    <div className="form-group horizontal-inputs">
                        <div>
                            <label htmlFor="precio">Precio</label>
                            <input type="text" id="precio" />
                        </div>
                        <div>
                        <label htmlFor="cantidad">Cantidad</label>
                        <input 
                            type="number" 
                            id="cantidad" 
                            min="1" 
                            value={cantidad} 
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) { // Asegura que solo se ingrese un número
                                    setCantidad(value ? parseInt(value) : '');
                                }
                            }} 
                        />
                    </div>


                    </div>
                    <div className="total-section">
                        Valor Producto
                        <br />
                        TOTAL
                    </div>
                    <div className="form-group">
                    <label htmlFor="valor-recibido">Valor Recibido</label>
                    <input 
                        type="text" 
                        id="valor-recibido" 
                        value={valorRecibido} 
                        onChange={(e) => {
                            const valor = e.target.value;
                            if (/^\d*\.?\d*$/.test(valor)) { // Permite solo números y un punto decimal
                                setValorRecibido(valor);
                            }
                        }} 
                    />
                </div>

                    <div className="form-group">
                        <label>Cambio</label>
                        <div className="cambio-value">{cambio.toFixed(2)}</div>
                    </div>
                    <div className="buttons">
                        <button type="button">Grabar</button>
                        <button type="button">Limpiar</button>
                        <button type="button">Imprimir</button>
                    </div>
                </form>
            </div>
            <div className="right-panel">
    <div className="receipt">
        <h2>CASINO IMA S.A.</h2>
        <p>11/08/2024 22:51</p>
        <p>Administradora Casino</p>
        <p className="receipt-number">RECIBO #{numeroRecibo}</p>
        <div className="receipt-table">
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '200px' }}>Producto</th>
                        <th style={{ width: '20%' }}>Cant.</th>
                        <th style={{ width: '20%' }}>Precio</th>
                        <th style={{ width: '20%' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Aquí se listarán los productos */}
                </tbody>
            </table>
        </div>
    </div>

</div>

<div className="product-button-container">
        <button className="product-button" onClick={handleNavigateToProductos}>
            <img src="ruta-a-la-imagen-del-carrito.png" alt="Productos" />
            <span>Productos</span>
        </button>
    </div>
</div> 
    );
}

export default Principal;
