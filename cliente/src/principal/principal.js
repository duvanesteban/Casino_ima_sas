import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import axios from 'axios';
import './principal.css';

function Principal() {
    const navigate = useNavigate();
    const [valorRecibido, setValorRecibido] = useState('0'); 
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
    const [nombreUsuario, setNombreUsuario] = useState(''); // Estado para el nombre del usuario
    const [idUsuario, setIdUsuario] = useState('');

    const descripcionRef = useRef(null);
    const cantidadRef = useRef(null);
    const valorRecibidoRef = useRef(null);
    const botonRef = useRef(null);  // Referencia al botón "Grabar"

    useEffect(() => {
        const token = localStorage.getItem('token'); // Obtener el token del localStorage
        if (token) {
            const decodedToken = jwt_decode(token); // Decodificar el token
            console.log(decodedToken);  // Ver qué propiedades tiene el token
            const nombre = decodedToken.nombreUsuario; // Extraer el nombre del usuario
            const id = decodedToken.idUsuario; // Extraer el ID del usuario
            setIdUsuario(id);  // Guardar el ID del usuario sin agregar "ID: " al valor
            setNombreUsuario(nombre); // Guardar el nombre en el estado
        }
    }, []);
    
    

    useEffect(() => {
        const valorRecibidoNum = parseFloat(valorRecibido.replace(/[,.]/g, '')) || 0;
        const totalProductos = calcularTotalProductos(); // Usar la suma de todos los productos
        const cambioCalculado = valorRecibidoNum - totalProductos; // Restar el total de productos
        setCambio(cambioCalculado); 
    }, [valorRecibido, productosAgregados]); // Asegurarse de recalcular cuando cambie el valor recibido o la lista de productos
    

    const handleNavigateToTablaInter = () => {
        navigate('/tablaInter');
    };

    const handleNavigateToProductos = () => {
        navigate('/productos');
    };

    const handleNavigateToRecibos = () => {
        navigate('/recibos');
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
            id: codigo,  // Aquí se añade el ID del producto
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

    const calcularTotalProductos = () => {
        return productosAgregados.reduce((acc, prod) => acc + prod.total, 0);
    };
    
    const handleEnviarRecibo = async () => {
        try {
            const token = localStorage.getItem('token');  // Obtener el token JWT almacenado en el localStorage
            const recibo = {
                valorTotal: calcularTotalProductos(),
                montoPagado: parseFloat(valorRecibido.replace(/[,.]/g, '')) || 0,
                cambio: cambio,
                idUsuario: idUsuario,  // Aquí estamos usando directamente el idUsuario almacenado
                cant: productosAgregados.length
            };
    
            const productos = productosAgregados.map(prod => ({
                idProducto: prod.id,  // El ID del producto agregado
                cantidadProductosComprados: prod.cantidad,
                totalCantidadPorPrecio: prod.total
            }));
    
            const data = { recibo, productos };  // Aquí enviamos la información en la estructura correcta
            console.log("esta es la información que voy a enviar para crear el recibo", data);
            
            // Hacer la petición POST al servidor con el token JWT en los encabezados
            const response = await axios.post('http://localhost:3002/recibos/', data, {
                headers: {
                    Authorization: `Bearer ${token}`  // Aquí se agrega el token en el encabezado Authorization
                }
            });
    
            // Verificar si el estado es 201, que indica creación exitosa
            if (response.status === 201) {
                console.log('Recibo creado con éxito:', response.data);
                alert('Recibo creado con éxito');
                handleLimpiarCampos();  // Limpiar los campos después de la creación
            } else {
                console.error('Error al crear el recibo:', response);
                alert('Error al crear el recibo');
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            alert('Error al enviar los datos');
        }
    };
    
    
    
    
    
    
    

    return (
        <div className="principal-container">
            <div className="left-panel">
                <h1>CASINO IMASAS</h1>
                <h1>Bienvenid@, {nombreUsuario}</h1> {/* Mostrar el mensaje de bienvenida */}
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
                        TOTAL : {calcularTotalProductos().toLocaleString('es-MX')}
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
                        <button type="button" onClick={handleEnviarRecibo}>Imprimir</button>
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
                                    <th>ID</th>  {/* Nueva columna para mostrar el ID */}
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
                                        <td style={{ width: '5px', textAlign: 'center' }}>{prod.id}</td> {/* Reducir el ancho de la columna ID */}
                                        <td>{prod.nombre}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                value={prod.cantidad}
                                                min="1"
                                                style={{ width: '30px', textAlign: 'center', border: 'none' }}
                                                onChange={(e) => {
                                                    const nuevaCantidad = parseInt(e.target.value, 10);
                                                    const nuevosProductos = [...productosAgregados];
                                                    nuevosProductos[index].cantidad = nuevaCantidad;
                                                    nuevosProductos[index].total = nuevosProductos[index].precio * nuevaCantidad;
                                                    setProductosAgregados(nuevosProductos);
                                                }}
                                            />
                                        </td>
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

                <button className="product-button" onClick={handleNavigateToTablaInter}>
                    <img src="ruta-a-la-imagen-del-carrito.png" alt="Productos" />
                    <span>Registros</span>
                </button>

                <button className="product-button" onClick={handleNavigateToRecibos}>
                    <img src="ruta-a-la-imagen-del-carrito.png" alt="Productos" />
                    <span>Recibos</span>
                </button>
            </div>
        </div> 
    );
}

export default Principal;
