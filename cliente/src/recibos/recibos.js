import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactModal from 'react-modal';
import './recibos.css';

ReactModal.setAppElement('#root');

function Recibos() {
    const [recibos, setRecibos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRecibo, setNewRecibo] = useState({
        valorTotal: '',
        montoPagado: '',
        cambio: '',
        idUsuario: '',
        cant: 1,
    });
    const [filters, setFilters] = useState({
        idRecibo: '',
        idUsuario: '',
    });
    const dropdownRef = useRef(null);
    const [isEditing, setIsEditing] = useState(null);
    const [updatedRecibo, setUpdatedRecibo] = useState({});
    const [selectedRecibos, setSelectedRecibos] = useState([]);

    useEffect(() => {
        fetchRecibos();
    }, [filters]);

    const token = localStorage.getItem('token');

    const fetchRecibos = async () => {
        let url = 'http://localhost:3002/recibos';
        // Asegúrate de que el token sea válido antes de hacer la solicitud
        if (!token) {
            console.error('No se encontró token en localStorage');
            return;
        }
    
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const recibos = response.data.body || [];
            setRecibos(recibos);
        } catch (error) {
            console.error('Error al obtener recibos', error);
            setError('Hubo un error al obtener los recibos.');
        }
    };
    
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRecibo({
            ...newRecibo,
            [name]: value
        });
    };

    const handleUpdateInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedRecibo({
            ...updatedRecibo,
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
            idRecibo: '',
            idUsuario: '',
        });
    };

    const handleSelectRecibo = (idRecibo) => {
        setSelectedRecibos(prevSelected => {
            const newSelected = prevSelected.includes(idRecibo)
                ? prevSelected.filter(id => id !== idRecibo)
                : [...prevSelected, idRecibo];
            return newSelected;
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allReciboIds = recibos.map(recibo => recibo.idRecibo);
            setSelectedRecibos(allReciboIds);
        } else {
            setSelectedRecibos([]);
        }
    };

    const handleAddRecibo = () => {
        const token = localStorage.getItem('token'); // Obtener el token
        axios.post('http://localhost:3002/recibos', newRecibo, {
            headers: {
                Authorization: `Bearer ${token}`  // Incluir el token en el encabezado de la solicitud
            }
        })
        .then(response => {
            setSuccessMessage('Recibo agregado con éxito.');
            fetchRecibos();
            setIsModalOpen(false);
        })
        .catch(error => {
            setError('Hubo un error al agregar el recibo. Inténtalo de nuevo.');
            console.error('Error al agregar el recibo', error);
        });
    };

    const handleSaveClick = (idRecibo) => {
        const token = localStorage.getItem('token'); // Obtener el token
        axios.put(`http://localhost:3002/recibos/${idRecibo}`, updatedRecibo, {
            headers: {
                Authorization: `Bearer ${token}`  // Incluir el token en el encabezado de la solicitud
            }
        })
        .then(response => {
            setSuccessMessage('Recibo actualizado con éxito.');
            fetchRecibos();
            setIsEditing(null);
        })
        .catch(error => {
            setError('Error al actualizar el recibo.');
            console.error('Error al actualizar el recibo', error);
        });
    };

    const handleEditClick = (idRecibo) => {
        const reciboToEdit = recibos.find(recibo => recibo.idRecibo === idRecibo);
        setUpdatedRecibo(reciboToEdit);
        setIsEditing(idRecibo);
    };

    return (
        <div className="recibos-container">
            <div className="InformacionSuperior">
                <h1 className="titulo">Lista de Recibos ({recibos.length})</h1>
                <div className="dropdown-container" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="dropdown-toggle">☰</button>
                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <button onClick={() => setIsModalOpen(true)}>Agregar Recibo</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="header-container">
                <div className="search-container">
                    <button className="delete-button" disabled={selectedRecibos.length === 0}>Eliminar Seleccionados</button>

                    <input 
                        type="text"
                        name="idRecibo"
                        placeholder="Filtrar por Recibo"
                        value={filters.idRecibo}
                        onChange={handleFilterChange}
                    />
                    <input 
                        type="text"
                        name="idUsuario"
                        placeholder="Filtrar por Usuario"
                        value={filters.idUsuario}
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
                            <th>ID Recibo</th>
                            <th>Fecha</th>
                            <th>Valor Total</th>
                            <th>Monto Pagado</th>
                            <th>Cambio</th>
                            <th>ID Usuario</th>
                            <th>Cantidad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recibos.length > 0 ? (
                            recibos.map((recibo) => (
                                <tr key={recibo.idRecibo}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedRecibos.includes(recibo.idRecibo)}
                                            onChange={() => handleSelectRecibo(recibo.idRecibo)}
                                        />
                                    </td>
                                    <td>{recibo.idRecibo}</td>
                                    <td>{recibo.fechaHoraRecibo}</td>
                                    <td>{recibo.valorTotal}</td>
                                    <td>{recibo.montoPagado}</td>
                                    <td>{recibo.cambio}</td>
                                    <td>{recibo.idUsuario}</td>
                                    <td>{recibo.cant}</td>
                                    <td>
                                        {isEditing === recibo.idRecibo ? (
                                            <>
                                                <button onClick={() => handleSaveClick(recibo.idRecibo)}>Guardar</button>
                                                <button onClick={() => setIsEditing(null)}>Cancelar</button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleEditClick(recibo.idRecibo)}>Actualizar</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">No hay recibos disponibles</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ReactModal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Agregar Nuevo Recibo"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <h2>Agregar Nuevo Recibo</h2>
                <div className="modal-form">
                    <div className="form-row">
                        <label>Valor Total:</label>
                        <input type="text" name="valorTotal" value={newRecibo.valorTotal} onChange={handleInputChange} />
                    </div>
                    <div className="form-row">
                        <label>Monto Pagado:</label>
                        <input type="text" name="montoPagado" value={newRecibo.montoPagado} onChange={handleInputChange} />
                    </div>
                    <div className="form-row">
                        <label>Cambio:</label>
                        <input type="text" name="cambio" value={newRecibo.cambio} onChange={handleInputChange} />
                    </div>
                    <div className="form-row">
                        <label>ID Usuario:</label>
                        <input type="text" name="idUsuario" value={newRecibo.idUsuario} onChange={handleInputChange} />
                    </div>
                    <div className="form-row">
                        <label>Cantidad:</label>
                        <input type="number" name="cant" value={newRecibo.cant} onChange={handleInputChange} min="1" />
                    </div>
                </div>
                <div className="modal-buttons">
                    <button onClick={handleAddRecibo}>Agregar</button>
                    <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
                </div>
            </ReactModal>
        </div>
    );
}

export default Recibos;
