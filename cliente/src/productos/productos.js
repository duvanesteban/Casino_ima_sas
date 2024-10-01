import React, { useState, useEffect, useRef} from 'react'; 
import axios from 'axios'; 
import ReactModal from 'react-modal'; 
import * as XLSX from 'xlsx';
import './productos.css';

ReactModal.setAppElement('#root');

function Productos() {
    const [productosDuplicados, setProductosDuplicados] = useState([]);
    const [loading, setLoading] = useState(false); // Nuevo estado para manejar el spinner
    const [successMessage, setSuccessMessage] = useState(null); // Nueva variable de estado para éxito
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProducto, setNewProducto] = useState({
        idProducto: 1,
        tipo: 'Preparado',
        nombreProducto: '',
        valorUnitario: '',
        estado: 'Activo'
    });
    const [filters, setFilters] = useState({
        idProducto: '',
        tipo: '',
        nombreProducto: '',
        estado: ''
    });
    const dropdownRef = useRef(null); // Referencia para el menú desplegable
    const [isEditing, setIsEditing] = useState(null);
    const [updatedProduct, setUpdatedProduct] = useState({});
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [uploadedExcelData, setUploadedExcelData] = useState([]); // Nueva línea para manejar datos cargados desde Excel

    useEffect(() => {
        fetchProductos();
    }, [filters]);

    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const fetchProductos = () => {
        let url = 'http://localhost:3002/productos';
        const queryParams = [];
    
        if (filters.estado) {
            queryParams.push(`estado=${encodeURIComponent(filters.estado)}`);
        }
        if (filters.idProducto) {
            queryParams.push(`idProducto=${encodeURIComponent(filters.idProducto)}`);
        }
        if (filters.nombreProducto) {
            queryParams.push(`nombreProducto=${encodeURIComponent(filters.nombreProducto)}`);
        }
        if (filters.tipo) {
            queryParams.push(`tipo=${encodeURIComponent(filters.tipo)}`);
        }
    
        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }
    
        console.log('Fetching URL:', url);
        axios.get(url)
            .then(response => {
                const productos = response.data.body || []; 
                setProductos(productos);
            })
            .catch(error => {
                setError('Hubo un error al obtener los productos. Por favor, inténtalo nuevamente.');
                console.error('Hubo un error al obtener los productos', error);
                setProductos([]); 
            });
    };

    // Función para generar el archivo Excel
    const handleGenerateExcel = () => {
        // Mapear los productos para reorganizar las propiedades en el orden deseado
        const productosOrdenados = productos.map(producto => ({
            idProducto: producto.idProducto,
            tipo: producto.tipo,
            nombreProducto: producto.nombreProducto,  // Colocamos "nombreProducto" como segunda columna
            valorUnitario: producto.valorUnitario,
            estado: producto.estado
        }));
    
        // Generar la hoja de trabajo con los productos en el nuevo orden
        const worksheet = XLSX.utils.json_to_sheet(productosOrdenados);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
        XLSX.writeFile(workbook, "productos.xlsx");
    };

    // Función para generar una plantilla de Excel
    const handleGenerateTemplate = () => {
        const maxId = productos.reduce((max, producto) => (producto.idProducto > max ? producto.idProducto : max), 0);

        const templateData = [
            { idProducto: maxId + 1, tipo: 'Preparado', nombreProducto: 'Producto de Ejemplo', valorUnitario: 1000, estado: 'Activo' },
            { idProducto: maxId + 2, tipo: 'Comprado', nombreProducto: 'Otro Producto de Ejemplo', valorUnitario: 2000, estado: 'Inactivo' }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PlantillaProductos");
        XLSX.writeFile(workbook, "plantilla_productos.xlsx");
    };

    // Función para manejar la subida de un archivo Excel
    const handleUploadExcel = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
    
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
                // Validar los datos del Excel
                const isValid = jsonData.every(row => {
                    const { idProducto, tipo, valorUnitario, estado } = row;
    
                    const isIdValid = typeof idProducto === 'number' && !isNaN(idProducto);
                    const isTipoValid = tipo === 'Preparado' || tipo === 'Comprado';
                    const isValorUnitarioValid = typeof valorUnitario === 'number' && !isNaN(valorUnitario);
                    const isEstadoValid = estado === 'Activo' || estado === 'Inactivo';
    
                    return isIdValid && isTipoValid && isValorUnitarioValid && isEstadoValid;
                });
    
                if (isValid) {
                    setUploadedExcelData(jsonData); // Guardar los datos cargados
                } else {
                    setError('Error: El archivo Excel contiene datos inválidos. Por favor verifica que los campos "idProducto", "tipo", "valorUnitario" y "estado" sean correctos.');
                    setUploadedExcelData([]); // Limpiar los datos cargados si hay un error
                }
            };
    
            reader.onerror = (error) => {
                console.error("Error al leer el archivo:", error);
            };
    
            reader.readAsBinaryString(file);
        }
    };
    
    

    // Nueva función para agregar productos desde el archivo Excel cargado
    const handleAddProductosFromExcel = () => {
        setLoading(true); // Iniciar spinner
        axios.post('http://localhost:3002/productos/', uploadedExcelData)
            .then(response => {
                const { productosAgregados, productosDuplicados } = response.data.body;
    
                // Mostrar mensajes según la respuesta del servidor
                let successMsg = "";
                let errorMsg = "";
    
                if (productosAgregados.length > 0) {
                    successMsg = `Se ha(n) agregado ${productosAgregados.length} producto(s) correctamente.`;
                }
    
                if (productosDuplicados.length <= 5) {
                    const nombresDuplicados = productosDuplicados
                        .map(p => `${p.nombreProducto} (${p.tipo})`)
                        .join(", ");
                    errorMsg = `Ya existen productos duplicados: ${nombresDuplicados}`;
                } 
                
                if (productosDuplicados.length > 5) {
                    errorMsg = `Hay ${productosDuplicados.length} producto(s) duplicados.`;
                    // Guardar los productos duplicados en el estado
                    // setProductosDuplicados(productosDuplicados);
                    generarExcelDuplicados(productosDuplicados);
                }
    
                if (successMsg) {
                    setSuccessMessage(successMsg); // Mensaje de éxito en verde
                }
    
                if (errorMsg) {
                    setError(errorMsg); // Mensaje de error en rojo
                }
    
                fetchProductos(); // Refrescar la lista de productos después de agregar
            })
            .catch(error => {
                setError('Hubo un error al agregar los productos desde Excel. Por favor, inténtalo nuevamente.');
                console.error('Hubo un error al agregar los productos desde Excel', error);
            })
            .finally(() => {
                setLoading(false); // Detener spinner
            });
    };
    
    
    // Función para generar el archivo Excel de productos duplicados
const generarExcelDuplicados = (productosDuplicados) => {
    // Reorganizar los productos duplicados en el formato deseado
    const productosOrdenados = productosDuplicados.map(producto => ({
        idProducto: producto.idProducto,
        tipo: producto.tipo,
        nombreProducto: producto.nombreProducto,
        valorUnitario: producto.valorUnitario,
        estado: producto.estado
    }));

    // Generar la hoja de trabajo con los productos duplicados
    const worksheet = XLSX.utils.json_to_sheet(productosOrdenados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProductosDuplicados");
    XLSX.writeFile(workbook, "productos_duplicados.xlsx");
};

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProducto({
            ...newProducto,
            [name]: value
        });
    };

    const handleUpdateInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedProduct({
            ...updatedProduct,
            [name]: value
        });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const handleClearFilters = () => {
        setFilters({
            idProducto: '',
            tipo: '',
            nombreProducto: '',
            estado: ''
        });
    };

    const handleSelectProduct = (idProducto) => {
        setSelectedProducts(prevSelected => {
            const newSelected = prevSelected.includes(idProducto)
                ? prevSelected.filter(id => id !== idProducto)
                : [...prevSelected, idProducto];

            if (newSelected.length === productos.length) {
                document.getElementById("selectAll").checked = true;
            } else {
                document.getElementById("selectAll").checked = false;
            }

            return newSelected;
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allProductIds = productos.map(producto => producto.idProducto);
            setSelectedProducts(allProductIds);
        } else {
            setSelectedProducts([]);
        }
    };

    const handleDeleteSelectedProducts = () => {
        const confirmDelete = window.confirm('¿Deseas eliminar todos los productos seleccionados?');
        
        if (confirmDelete) {
            axios.post('http://localhost:3002/productos/eliminar-multiples', { ids: selectedProducts })
                .then(response => {
                    setProductos(prevProductos => prevProductos.filter(producto => !selectedProducts.includes(producto.idProducto)));
                    setSelectedProducts([]);
                    setSuccessMessage(response.data.body || 'Producto eliminado con éxito.'); // Mostrar mensaje de éxito
                })
                .catch(error => {
                    setError('Hubo un error al eliminar el producto. Por favor, inténtalo nuevamente.')
                });
        }
    };
    

    const handleAddProducto = () => {
        axios.post('http://localhost:3002/productos', newProducto)
            .then(response => {
                const { productosAgregados, productosDuplicados } = response.data.body;
    
                // Mostrar mensajes según la respuesta del servidor
                if (productosAgregados.length > 0) {
                    // Limpiar el mensaje de error antes de establecer un mensaje de éxito
                    //setError(null);
                    const nombresAgregados = productosAgregados
                        .map(p => `${p.nombreProducto} (${p.tipo})`) // Mostrar nombre y tipo
                        .join(", ");
                    setSuccessMessage(`Se ha(n) agregado ${productosAgregados.length} producto(s) correctamente: ${nombresAgregados}`);
                }
                
    
                if (productosDuplicados.length > 0) {
                    // Limpiar el mensaje de éxito antes de establecer un mensaje de error
                    //setSuccessMessage(null);
                    const nombresDuplicados = productosDuplicados.map(p => `${p.nombreProducto} (${p.tipo})`)
                    .join(", ");
                    setError(`Ya existen productos duplicados: ${nombresDuplicados}`);
                }
    
                fetchProductos(); // Refrescar la lista de productos después de agregar
                setIsModalOpen(false); // Cerrar el modal
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setError(error.response.data.message || 'Hubo un error al agregar el producto. Por favor, inténtalo nuevamente.');
                } else {
                    setError('Hubo un error al agregar el producto. Por favor, inténtalo nuevamente.');
                }
                console.error('Hubo un error al agregar el producto', error);
            });
    };
    

    const handleSaveClick = (idProducto) => {
        axios.put(`http://localhost:3002/productos/${idProducto}`, updatedProduct)
            .then(response => {
                fetchProductos();
                setIsEditing(null);
                setError(null); // Limpiar el error si la solicitud fue exitosa
                setSuccessMessage(response.data.body || 'Producto actualizado con éxito.'); // Mostrar mensaje de éxito
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                     // Asignar el mensaje del servidor si está disponible
                     setSuccessMessage(null);
                    setError(error.response.data.body || 'Hubo un error al actualizar el producto. Por favor, inténtalo nuevamente.');
                } 
            });
    };
    
    

    const handleEditClick = (idProducto) => {
        const productToEdit = productos.find(producto => producto.idProducto === idProducto);
        setUpdatedProduct(productToEdit);
        setIsEditing(idProducto);
    };

    const handleOpenModal = () => {
        const maxId = productos.reduce((max, producto) => (producto.idProducto > max ? producto.idProducto : max), 0);
        setNewProducto({
            idProducto: maxId + 1,
            tipo: 'Preparado',
            nombreProducto: '',
            valorUnitario: '',
            estado: 'Activo'
        });
        setIsModalOpen(true);
    };
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="productos-container">
          <div className='InformacionSuperior'>
                <h1 className="titulo">Lista de Productos ({productos.length})</h1>  {/* Título separado y centrado */}
         <div className="dropdown-container" ref={dropdownRef}>
                    <button onClick={toggleDropdown} className="dropdown-toggle">
                        {/* Aquí va el ícono o las tres líneas que deseas mostrar */}
                        ☰
                    </button>

                    {isDropdownOpen && (
            <div className="dropdown-menu">
                <button onClick={handleGenerateTemplate}>Generar Plantilla Excel</button>
                <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={handleUploadExcel} 
                />
                <button 
                    onClick={handleAddProductosFromExcel} 
                    disabled={uploadedExcelData.length === 0 || loading}
                >
                    {loading ? 'Cargando...' : 'Agregar Productos desde Excel'} {/* Mostrar spinner */}
                </button>
                <button onClick={handleGenerateExcel}>Generar Excel</button>
                <button onClick={handleOpenModal}>Agregar Producto</button>
            </div>
        )}

      </div>
    </div>
    {loading && <div className="spinner">Cargando...</div>}

            <div className="header-container">
                <div className="search-container">
                  <button
                        onClick={handleDeleteSelectedProducts}
                        className="delete-button"
                        disabled={selectedProducts.length === 0}
                    >
                        Eliminar Seleccionados
                    </button>
                    
                    <select name="tipo" value={filters.tipo} onChange={handleFilterChange}>
                        <option value="">Filtrar por Tipo</option>
                        <option value="Preparado">Preparado</option>
                        <option value="Comprado">Comprado</option>
                    </select>

                    <select name="estado" value={filters.estado} onChange={handleFilterChange}>
                        <option value="">Filtrar por Estado</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>

                    <input 
                        type="text" 
                        name="idProducto" 
                        placeholder="Buscar por ID" 
                        value={filters.idProducto} 
                        onChange={handleFilterChange}
                    />

                    <input 
                        type="text" 
                        name="nombreProducto" 
                        placeholder="Buscar por Nombre" 
                        value={filters.nombreProducto} 
                        onChange={handleFilterChange}
                    />
                    <button onClick={handleClearFilters}>Limpiar Filtros</button> {/* Botón para limpiar filtros */}
                

                </div>

                
            </div>

            {(error || successMessage) && (
                <>
                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={() => setError(null)} className="close-button">X</button>
                    </div>
                )}

                    {successMessage && (
                        <div className="success-message">
                            {successMessage}
                            <button onClick={() => setSuccessMessage(null)} className="close-button">X</button>
                        </div>
                    )}
                </>
            )}




    
            <div className="table-wrapper">
                <table>
                    <thead className="TitulosTabla">
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    onChange={handleSelectAll}
                                />
                                Seleccionar Todo
                            </th>
                            <th>ID Producto</th>
                            <th>Tipo</th>
                            <th>Nombre Producto</th>
                            <th>Valor Unitario</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length > 0 ? (
                            productos.map(producto => (
                                <tr key={producto.idProducto}>
                                    <td onClick={() => handleSelectProduct(producto.idProducto)}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(producto.idProducto)}
                                                onChange={() => handleSelectProduct(producto.idProducto)}
                                                style={{ pointerEvents: 'none' }}
                                            />
                                        </div>
                                    </td>
                                    <td>{producto.idProducto}</td>
                                    <td>{isEditing === producto.idProducto ? (
                                            <select
                                                name="tipo"
                                                value={updatedProduct.tipo}
                                                onChange={handleUpdateInputChange}
                                                style={{ width: '100px', height: '30px' }}
                                            >
                                                <option value="Preparado">Preparado</option>
                                                <option value="Comprado">Comprado</option>
                                            </select>
                                        ) : (
                                            producto.tipo
                                        )}
                                    </td>
                                    <td>{isEditing === producto.idProducto ? (
                                            <input
                                                type="text"
                                                name="nombreProducto"
                                                value={updatedProduct.nombreProducto}
                                                onChange={handleUpdateInputChange}
                                                style={{ width: '440px', height: '30px' }}
                                            />
                                        ) : (
                                            producto.nombreProducto
                                        )}
                                    </td>
                                    <td>
                                        {isEditing === producto.idProducto ? (
                                            <input
                                                type="text"
                                                name="valorUnitario"
                                                value={updatedProduct.valorUnitario}
                                                onChange={handleUpdateInputChange}
                                                pattern="[0-9]*"
                                                inputMode="numeric"
                                                style={{ width: '100px', height: '30px' }}
                                            />
                                        ) : (
                                            parseInt(producto.valorUnitario).toLocaleString('es-ES')
                                        )}
                                    </td>
                                    <td>{isEditing === producto.idProducto ? (
                                            <select
                                                name="estado"
                                                value={updatedProduct.estado}
                                                onChange={handleUpdateInputChange}
                                                style={{ width: '100px', height: '30px' }}
                                            >
                                                <option value="Activo">Activo</option>
                                                <option value="Inactivo">Inactivo</option>
                                            </select>
                                        ) : (
                                            producto.estado
                                        )}
                                    </td>
                                    <td>
                                        {isEditing === producto.idProducto ? (
                                            <>
                                                <button onClick={() => handleSaveClick(producto.idProducto)}>Guardar</button>
                                                <button onClick={() => setIsEditing(null)}>Cancelar</button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleEditClick(producto.idProducto)}>Actualizar</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No hay productos disponibles</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ReactModal 
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Agregar Nuevo Producto"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <h2>Agregar Nuevo Producto</h2>
                
                <div className="modal-form">
                    <div className="form-row">
                        <label>
                            ID Producto:
                            <input
                                type="number"
                                name="idProducto"
                                value={newProducto.idProducto}
                                onChange={handleInputChange}
                                min="1"
                            />
                        </label>
                    </div>
                    <div className="form-row">
                        <label>
                            Tipo:
                            <select
                                name="tipo"
                                value={newProducto.tipo}
                                onChange={handleInputChange}
                            >
                                <option value="Preparado">Preparado</option>
                                <option value="Comprado">Comprado</option>
                            </select>
                        </label>
                    </div>
                    <div className="form-row">
                        <label>
                            Nombre Producto:
                            <input
                                type="text"
                                name="nombreProducto"
                                value={newProducto.nombreProducto}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>
                    <div className="form-row">
                        <label>
                            Valor Unitario:
                            <input
                                type="text"
                                name="valorUnitario"
                                value={newProducto.valorUnitario}
                                onChange={handleInputChange}
                                pattern="[0-9]*"
                                inputMode="numeric"
                            />
                        </label>
                    </div>
                    <div className="form-row">
                        <label>
                            Estado:
                            <select
                                name="estado"
                                value={newProducto.estado}
                                onChange={handleInputChange}
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className="modal-buttons">
                    <button onClick={handleAddProducto}>Agregar</button>
                    <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
                </div>
            </ReactModal>
        </div>
    );
}

export default Productos;
