import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import ReactModal from 'react-modal'; 
import * as XLSX from 'xlsx';
import './productos.css';

ReactModal.setAppElement('#root');

function Productos() {
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
    const [isEditing, setIsEditing] = useState(null);
    const [updatedProduct, setUpdatedProduct] = useState({});
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        fetchProductos();
    }, [filters]);

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
        const worksheet = XLSX.utils.json_to_sheet(productos);
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
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Aquí podrías enviar jsonData al backend o procesarlo como desees
            axios.post('http://localhost:3002/productos', jsonData)
                .then(response => {
                    fetchProductos(); // Refrescar la lista de productos después de cargar el Excel
                })
                .catch(error => {
                    setError('Hubo un error al cargar el archivo Excel. Por favor, inténtalo nuevamente.');
                    console.error('Hubo un error al cargar el archivo Excel', error);
                });
        };

        reader.readAsArrayBuffer(file);
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
                })
                .catch(error => {
                    setError('Hubo un error al eliminar los productos seleccionados. Por favor, inténtalo nuevamente.');
                    console.error('Hubo un error al eliminar los productos', error);
                });
        }
    };
    

    const handleAddProducto = () => {
        axios.post('http://localhost:3002/productos', newProducto)
            .then(response => {
                fetchProductos();
                setIsModalOpen(false);
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
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    setError(error.response.data.message || 'Hubo un error al actualizar el producto. Por favor, inténtalo nuevamente.');
                } else {
                    setError('Hubo un error al actualizar el producto. Por favor, inténtalo nuevamente.');
                }
                console.error('Hubo un error al actualizar el producto', error);
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

    return (
        <div className="productos-container">
            <h1 className="titulo">Lista de Productos ({productos.length})</h1>  {/* Título separado y centrado */}
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
                    <button onClick={handleOpenModal}>Agregar Producto</button>
                    <button onClick={handleGenerateExcel}>Generar Excel</button> {/* Botón para generar Excel */}

                </div>

                
            </div>
            <div className='search-container'>
            <button onClick={handleGenerateTemplate}>Generar Plantilla Excel</button> {/* Botón para generar Plantilla Excel */}
                    <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        onChange={handleUploadExcel} 
                    /> {/* Botón para subir Excel */}
            </div>
            {error && (
                <p className="error-message">{error}</p>
            )}
    
            <div className="table-wrapper">
                <table>
                    <thead>
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
