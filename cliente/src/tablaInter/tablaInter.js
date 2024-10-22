import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactModal from 'react-modal';
import './tablaInter.css'; // Asegúrate de crear y vincular el archivo CSS correcto

ReactModal.setAppElement('#root');

function Tablainter() {
    const [registros, setRegistros] = useState([]); // Estado para almacenar registros de la tabla intermedia
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRegistro, setNewRegistro] = useState({
        idRecibo: '',  // Cambiado a idRecibo
        idProducto: '',
        cantidadProductosComprados: '',
        totalCantidadPorPrecio: ''
    });
    const [filters, setFilters] = useState({
        idRecibo: '',  // Cambiado a idRecibo
        idProducto: '',
    });
    const dropdownRef = useRef(null);
    const [isEditing, setIsEditing] = useState(null);
    const [updatedRegistro, setUpdatedRegistro] = useState({});
    const [selectedRegistros, setSelectedRegistros] = useState([]);

    useEffect(() => {
        fetchRegistros();
    }, [filters]);

    // Obtener registros con el nombre del producto ya unido desde el backend
    const fetchRegistros = async () => {
        let url = 'http://localhost:3002/tablainter';
        const queryParams = [];
      
        if (filters.idRecibo) {  // Cambiado a idRecibo
            queryParams.push(`idRecibo=${encodeURIComponent(filters.idRecibo)}`);
        }
        if (filters.idProducto) {
            queryParams.push(`idProducto=${encodeURIComponent(filters.idProducto)}`);
        }
      
        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }
      
        try {
            const response = await axios.get(url);
            const registros = response.data.body || [];
            setRegistros(registros);  // Aquí los registros deben incluir nombreProducto
            console.log(registros); // Asegúrate de ver el nombreProducto en los registros en la consola del navegador
        } catch (error) {
            setError('Hubo un error al obtener los registros. Por favor, inténtalo nuevamente.');
            console.error('Error al obtener registros', error);
            setRegistros([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRegistro({
            ...newRegistro,
            [name]: value
        });
    };

    const handleUpdateInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedRegistro({
            ...updatedRegistro,
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
            idRecibo: '',  // Cambiado a idRecibo
            idProducto: ''
        });
    };

    const handleSelectRegistro = (idTablaIntermediaProductoRecibo) => {
        setSelectedRegistros(prevSelected => {
            const newSelected = prevSelected.includes(idTablaIntermediaProductoRecibo)
                ? prevSelected.filter(id => id !== idTablaIntermediaProductoRecibo)
                : [...prevSelected, idTablaIntermediaProductoRecibo];

            return newSelected;
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allRegistroIds = registros.map(registro => registro.idTablaIntermediaProductoRecibo);
            setSelectedRegistros(allRegistroIds);
        } else {
            setSelectedRegistros([]);
        }
    };

    const handleAddRegistro = () => {
        axios.post('http://localhost:3002/tablainter', newRegistro)
            .then(response => {
                setSuccessMessage('Registro agregado con éxito.');
                fetchRegistros();
                setIsModalOpen(false);
            })
            .catch(error => {
                setError('Hubo un error al agregar el registro. Inténtalo de nuevo.');
                console.error('Error al agregar el registro', error);
            });
    };

    const handleSaveClick = (idTablaIntermediaProductoRecibo) => {
        axios.put(`http://localhost:3002/tablainter/${idTablaIntermediaProductoRecibo}`, updatedRegistro)
            .then(response => {
                setSuccessMessage('Registro actualizado con éxito.');
                fetchRegistros();
                setIsEditing(null);
            })
            .catch(error => {
                setError('Error al actualizar el registro.');
                console.error('Error al actualizar el registro', error);
            });
    };

    const handleEditClick = (idTablaIntermediaProductoRecibo) => {
        const registroToEdit = registros.find(registro => registro.idTablaIntermediaProductoRecibo === idTablaIntermediaProductoRecibo);
        setUpdatedRegistro(registroToEdit);
        setIsEditing(idTablaIntermediaProductoRecibo);
    };

    return (
        <div className="tablainter-container">
            <div className="InformacionSuperior">
                <h1 className="titulo">Lista de Registros ({registros.length})</h1>
                <div className="dropdown-container" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="dropdown-toggle">☰</button>
                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <button onClick={() => setIsModalOpen(true)}>Agregar Registro</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="header-container">
                <div className="search-container">
                    <button className="delete-button" disabled={selectedRegistros.length === 0}>Eliminar Seleccionados</button>

                    <input 
                        type="text"
                        name="idRecibo"  // Cambiado a idRecibo
                        placeholder="Filtrar por Recibo"
                        value={filters.idRecibo}  // Cambiado a idRecibo
                        onChange={handleFilterChange}
                    />
                    <input 
                        type="text"
                        name="idProducto"
                        placeholder="Filtrar por Producto"
                        value={filters.idProducto}
                        onChange={handleFilterChange}
                    />

                    <button onClick={handleClearFilters}>Limpiar Filtros</button>
                </div>
            </div>

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
                            <th>ID Recibo</th> {/* Cambiado de ID Usuario a ID Recibo */}
                            <th>ID Producto</th>
                            <th>Nombre Producto</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registros.length > 0 ? (
                            registros.map((registro) => (
                                <tr key={registro.idTablaIntermediaProductoRecibo}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedRegistros.includes(registro.idTablaIntermediaProductoRecibo)}
                                            onChange={() => handleSelectRegistro(registro.idTablaIntermediaProductoRecibo)}
                                        />
                                    </td>
                                    <td>{registro.idRecibo}</td>  {/* Cambiado de idUsuario a idRecibo */}
                                    <td>{registro.idProducto}</td>
                                    <td>{registro.nombreProducto}</td>  {/* Mostrar el nombre del producto */}
                                    <td>{registro.cantidadProductosComprados}</td>
                                    <td>{registro.totalCantidadPorPrecio}</td>
                                    <td>
                                        {isEditing === registro.idTablaIntermediaProductoRecibo ? (
                                            <>
                                                <button onClick={() => handleSaveClick(registro.idTablaIntermediaProductoRecibo)}>Guardar</button>
                                                <button onClick={() => setIsEditing(null)}>Cancelar</button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleEditClick(registro.idTablaIntermediaProductoRecibo)}>Actualizar</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No hay registros disponibles</td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>

            <ReactModal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Agregar Nuevo Registro"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <h2>Agregar Nuevo Registro</h2>

                <div className="modal-form">
                    <div className="form-row">
                        <label>ID Recibo:</label> {/* Cambiado de ID Usuario a ID Recibo */}
                        <input type="text" name="idRecibo" value={newRegistro.idRecibo} onChange={handleInputChange} /> {/* Cambiado a idRecibo */}
                    </div>
                    <div className="form-row">
                        <label>ID Producto:</label>
                        <input type="text" name="idProducto" value={newRegistro.idProducto} onChange={handleInputChange} />
                    </div>
                    <div className="form-row">
                        <label>Cantidad:</label>
                        <input type="number" name="cantidadProductosComprados" value={newRegistro.cantidadProductosComprados} onChange={handleInputChange} />
                    </div>
                    <div className="form-row">
                        <label>Total:</label>
                        <input type="number" name="totalCantidadPorPrecio" value={newRegistro.totalCantidadPorPrecio} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="modal-buttons">
                    <button onClick={handleAddRegistro}>Agregar</button>
                    <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
                </div>
            </ReactModal>
        </div>
    );
}

export default Tablainter;
