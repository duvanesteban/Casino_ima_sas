import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './principal.css';

function Principal() {
    const navigate = useNavigate();
    const [valorRecibido, setValorRecibido] = useState(''); 
    const [cambio, setCambio] = useState(''); 
    const [numeroRecibo, setNumeroRecibo] = useState(1); 
    const [cantidad, setCantidad] = useState(1); 
    const [codigo, setCodigo] = useState(''); 
    const [producto, setProducto] = useState(''); 
    const [precio, setPrecio] = useState('');
    const [total, setTotal] = useState(''); 
    const [descripcion, setDescripcion] = useState(''); 
    const [error, setError] = useState(null); 
    const [productosAgregados, setProductosAgregados] = useState([]); 

    const descripcionRef = useRef(null);
    const cantidadRef = useRef(null);
    const valorRecibidoRef = useRef(null);
    const botonRef = useRef(null);  // Referencia al botón "Grabar"



    useEffect(() => {
        const valorRecibidoNum = parseFloat(valorRecibido.replace(/[,.]/g, '')) || 0;
        const cambioCalculado = valorRecibidoNum - total;
        setCambio(cambioCalculado); 
    }, [valorRecibido, total]);

    const handleNavigateToProductos = () => {
        navigate('/productos');
    };

    const handleCodigoChange = (e) => {
        setCodigo(e.target.value);
    };

    const handleBuscarProductoPorCodigo = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (codigo) {
                try {
                    const response = await axios.get(`http://localhost:3002/productos/idProducto/${codigo}`);
                    const productoData = response.data.body[0];
                    if (productoData) {
                        setProducto(productoData.nombreProducto);
                        setPrecio(productoData.valorUnitario);
                        setDescripcion(`${productoData.tipo} - ${productoData.estado}`);
                        setError(null);
                        descripcionRef.current.focus();
                    } else {
                        setProducto('');
                        setPrecio(0);
                        setDescripcion('');
                        setError('Producto no encontrado');
                    }
                } catch (error) {
                    console.error('Error al buscar el producto', error);
                    setProducto('');
                    setPrecio(0);
                    setDescripcion('');
                    setError('Error al buscar el producto');
                }
            } else {
                setProducto('');
                setPrecio(0);
                setDescripcion('');
                setError(null);
            }
        }
    };

    const handleDescripcionEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            cantidadRef.current.focus();
        }
    };

    const handleCantidadEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            valorRecibidoRef.current.focus();
        }
    };
    const handleBotonEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            botonRef.current.focus();  // Enfocar el botón "Grabar"

        }
        
    };

    

    useEffect(() => {
        if (cantidad) {
            setTotal(precio * parseInt(cantidad));
        } else {
            setTotal(0);
        }
    }, [precio, cantidad]);

    const handleValorRecibidoChange = (e) => {
        let valor = e.target.value.replace(/[^0-9]/g, ''); 
        if (valor === '') {
            setValorRecibido(''); 
            return;
        }
        let formateado = parseInt(valor, 10).toLocaleString('es-MX');
        setValorRecibido(formateado); 
    };

    const handlePrecioChange = (e) => {
        let valor = e.target.value.replace(/[^0-9]/g, '');
        if (valor === '') {
            setPrecio('');
            return;
        }
        setPrecio(parseInt(valor, 10)); 
    };

    const handleGrabarProducto = () => {
        if (!producto || !cantidad || !precio || !total) {
            setError("Por favor, complete todos los campos.");
            return;
        }

        const nuevoProducto = {
            nombre: producto,
            cantidad: cantidad,
            precio: precio,
            total: total
        };
        
        setProductosAgregados([...productosAgregados, nuevoProducto]);
       
    };

    // Función para eliminar un producto de la lista
    const handleEliminarProducto = (index) => {
        const nuevaListaProductos = productosAgregados.filter((_, i) => i !== index);
        setProductosAgregados(nuevaListaProductos);
    };

    const handleLimpiarCampos = () => {
        setCodigo(''); 
        setProducto('');
        setDescripcion('');
        setPrecio('');
        setCantidad(1); 
        setTotal('');
        setValorRecibido('');
        setCambio('');
        setError(null);
    };
    const LimpiarCampos = () => {
        setProductosAgregados([]);  // Limpia la lista de productos
    };

    return (
        <div className="principal-container">
            <div className="left-panel">
                <h1>CASINO IMASAS</h1>
                <form>
                    <div className="form-group">
                        <label htmlFor="codigo">Código</label>
                        <input
                            type="text"
                            id="codigo"
                            value={codigo}
                            onChange={handleCodigoChange}
                            onKeyDown={handleBuscarProductoPorCodigo} 
                        />
                    </div>
                    <div className="form-group large-input">
                        <label htmlFor="producto">Producto</label>
                        <input
                            type="text"
                            id="producto"
                            value={producto}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <input 
                            type="text" 
                            id="descripcion" 
                            ref={descripcionRef} 
                            value={descripcion} 
                            onKeyDown={handleDescripcionEnter} 
                        />
                    </div>
                    <div className="form-group horizontal-inputs">
                        <div>
                            <label htmlFor="precio">Precio</label>
                            <input
                                type="text"
                                id="precio"
                                value={precio ? precio.toLocaleString('es-MX') : ''}
                                onChange={handlePrecioChange} 
                            />
                        </div>
                        <div>
                            <label htmlFor="cantidad">Cantidad</label>
                            <input 
                                type="number" 
                                id="cantidad" 
                                min="1" 
                                value={cantidad} 
                                ref={cantidadRef} 
                                onChange={(e) => setCantidad(e.target.value)}
                                onKeyDown={handleCantidadEnter} 
                            />
                        </div>
                    </div>
                    <div className="total-section">
                        Valor Producto : {total.toLocaleString('ES-MX')}
                        <br />
                        TOTAL :
                    </div>
                    {error && <p style={{color: 'red'}}>{error}</p>}
                    <div className="form-group">
                        <label htmlFor="valor-recibido">Valor Recibido</label>
                        <input 
                            type="text" 
                            id="valor-recibido" 
                            value={valorRecibido} 
                            ref={valorRecibidoRef} 
                            onChange={handleValorRecibidoChange}
                            onKeyDown={handleBotonEnter}  // Al presionar Enter, enfoca el botón
                        />
                    </div>

                    <div className="form-group">
                        <label>Cambio</label>
                        <div className="cambio-value">{cambio.toLocaleString('ES-MX')}</div> 
                    </div>
                    <div className="buttons">
                        <button type="button" onClick={handleGrabarProducto} ref={botonRef}>Grabar</button>
                        <button type="button" onClick={handleLimpiarCampos}>Limpiar</button>
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
                                    <th>Producto</th>
                                    <th>Cant.</th>
                                    <th>Precio</th>
                                    <th>Total</th>
                                    <th>Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosAgregados.map((prod, index) => (
                                    <tr key={index}>
                                        <td>{prod.nombre}</td>
                                        <td>{prod.cantidad}</td>
                                        <td>{prod.precio.toLocaleString('es-MX')}</td>
                                        <td>{prod.total.toLocaleString('es-MX')}</td>
                                        <td>
                                            <button onClick={() => handleEliminarProducto(index)}>X</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='ParteInferior'>
                    <button type="button" onClick={LimpiarCampos} onKeyDown={handleBotonEnter} >Limpiar</button>
                    </div>
                </div>


                
            </div>

            <div className="product-button-container">
                <button className="product-button" onClick={handleNavigateToProductos}>
                    <img src="ruta-a-la-imagen-del-carrito.png" alt="Productos" />
                    <span>Productos</span>
                </button>

                <button className="product-button" onClick={handleNavigateToProductos}>
                    <img src="ruta-a-la-imagen-del-carrito.png" alt="Productos" />
                    <span>Facturas</span>
                </button>
            </div>
        </div> 
    );
}

export default Principal;
