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

    // Modificación de la función agregar
    async function agregar(productos) {
        let productosDuplicados = [];
        let productosAgregados = [];
    
        try {
            const productosArray = Array.isArray(productos) ? productos : [productos];
    
            for (const productoData of productosArray) {
                const { idProducto, nombreProducto, valorUnitario, estado, tipo } = productoData;
    
                if (!idProducto || !nombreProducto || !valorUnitario || !estado || !tipo) {
                    throw new Error("Todos los campos son obligatorios y no pueden estar vacíos.");
                }
    
                // Verificar duplicados por nombreProducto y tipo
                const productosExistentes = await db.buscarPorNombreYTipo(nombreProducto, tipo);
                if (productosExistentes.length > 0) {
                    console.log(`Producto duplicado encontrado en controlador: ${nombreProducto} (${tipo})`); // Mensaje de depuración
                    productosDuplicados.push(productoData);  // Agregar a duplicados
                    continue;  // Saltar a la siguiente iteración, no intentar agregar este producto
                }
    
                await db.agregar(TABLA, productoData);
                productosAgregados.push(productoData);  // Agregar a agregados exitosamente
            }
    
            // Retornar resultados
            return {
                mensaje: "Proceso de inserción completado",
                productosAgregados,
                productosDuplicados
            };
        } catch (error) {
            console.error("Error al agregar los productos:", error);
            throw error;  // Lanza cualquier otro error no relacionado con duplicados
        }
    }
    
    async function actualizar(idProducto, body) {
        try {
            const productoActual = await db.buscarPorIdProducto(idProducto);

            if (!productoActual.length) {
                throw new Error('Producto no encontrado.');
            }

            const productoExistente = productoActual[0];

            if (body.nombreProducto !== productoExistente.nombreProducto || body.tipo !== productoExistente.tipo) {
                const productosConMismoNombreYTipo = await db.buscarPorNombreYTipo(body.nombreProducto, body.tipo);

                if (productosConMismoNombreYTipo.length > 0 && productosConMismoNombreYTipo[0].idProducto !== idProducto) {
                    throw new Error(`Ya existe un producto con el nombre "${body.nombreProducto}" y tipo "${body.tipo}".`);
                }
            }

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
        agregar,  // Modificación: se mantiene la lógica de verificación dentro de esta función de agregar
        actualizar,
        eliminar,
        buscarPorIdProducto,
        buscarPorTipo,
        eliminarMultiples,
        buscarPorEstado,
        buscarConFiltros
    };
};
