const TABLA = 'productos';

module.exports = function (dbInyectada) {
    let db = dbInyectada;
    if (!db) {
        db = require('../../DB/productosMysql');
    }

    function todos() {
        return db.todos(TABLA);
    }

    function buscarPorNombre(nombreProducto) {
        return db.buscarPorNombre(nombreProducto);
        }

        function buscarPorIdProducto(id) {
            return db.buscarPorIdProducto(id);
        }


    // Utiliza esta función para agregar productos, verificando duplicidad antes de la inserción
    async function agregar(productos) {
        try {
            const productosArray = Array.isArray(productos) ? productos : [productos];
    
            await Promise.all(productosArray.map(async (productoData) => {
                const { idProducto, nombreProducto, valorUnitario, estado, tipo } = productoData;
    
                if (!idProducto || !nombreProducto || !valorUnitario || !estado || !tipo) {
                    throw new Error("Todos los campos son obligatorios y no pueden estar vacíos.");
                }
    
                // Verificar duplicados por nombreProducto y tipo
                const productosExistentes = await db.buscarPorNombreYTipo(nombreProducto, tipo);
                if (productosExistentes.length > 0) {
                    throw new Error(`El producto con el nombre "${nombreProducto}" y tipo "${tipo}" ya existe en la base de datos.`);
                }
    
                await db.agregar(TABLA, productoData);
            }));
    
            return "Productos agregados exitosamente";
        } catch (error) {
            console.error("Error al agregar los productos:", error);
            throw error;
        }
    }
    
    
    
    

    async function actualizar(idProducto, body) {
        try {
            // Obtener el producto actual desde la base de datos
            const productoActual = await db.buscarPorIdProducto(idProducto);
    
            if (!productoActual.length) {
                throw new Error('Producto no encontrado.');
            }
    
            const productoExistente = productoActual[0];
    
            // Verificar si el nombre o el tipo han cambiado
            if (body.nombreProducto !== productoExistente.nombreProducto || body.tipo !== productoExistente.tipo) {
                // Verificar si ya existe otro producto con el mismo nombre y tipo
                const productosConMismoNombreYTipo = await db.buscarPorNombreYTipo(body.nombreProducto, body.tipo);
    
                if (productosConMismoNombreYTipo.length > 0 && productosConMismoNombreYTipo[0].idProducto !== idProducto) {
                    throw new Error(`Ya existe un producto con el nombre "${body.nombreProducto}" y tipo "${body.tipo}".`);
                }
            }
    
            // Actualizar el producto en la base de datos
            return await db.actualizar(TABLA, idProducto, body);
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            throw error;
        }
    }
    
    

    function eliminar(idProducto) {
        return db.eliminar(TABLA, idProducto);
    }

    function buscarPorEstado(estado) {
        return db.buscarPorEstado(estado);
    }

        // Nueva función para buscar productos por tipo
        function buscarPorTipo(tipo) {
            return db.buscarPorTipo(tipo);
        }

        async function eliminarMultiples(ids) {
            return db.eliminarMultiples(ids);
        }

        function buscarConFiltros(filtros) {
            return db.buscarConFiltros(filtros);
        }
        

    return {
        todos,
        buscarPorNombre,
        agregar,  // Solo mantiene la lógica de verificación dentro de esta función de agregar
        actualizar,
        eliminar,
        buscarPorIdProducto,
        buscarPorTipo,
        eliminarMultiples,
        buscarPorEstado,
        buscarConFiltros
        
    };
}