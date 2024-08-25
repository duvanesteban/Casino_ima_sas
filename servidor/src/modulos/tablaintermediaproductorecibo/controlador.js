const TABLA = 'tablaintermediaproductorecibo';

module.exports = function(dbInyectada) {
    let db = dbInyectada;
    if (!db) {
        db = require('../../DB/tablaintermediaproductorecibo.js');
    }
    async function agregar(body) {
        const { idRecibo, productos } = body;
    
        // Verificar si el idRecibo ya existe
        const existente = await db.query(TABLA, { idRecibo: idRecibo });
    
        if (existente.length > 0) {
            return {
                status: 400,
                mensaje: `El idRecibo ${idRecibo} ya existe. No se puede agregar un recibo duplicado.`
            };
        }
    
        try {
            const productosFormateados = await Promise.all(productos.map(async producto => {
                // Obtener el precio del producto
                const resultado = await db.query('productos', { idProducto: producto.idProducto });
                if (resultado.length === 0) {
                    throw new Error(`Producto con id ${producto.idProducto} no encontrado`);
                }
    
                const precio = resultado[0].valorUnitario; // Ajustar según el nombre de la columna
                const totalCantidadPorPrecio = precio * producto.cantidadProductosComprados;
    
                // Verificar si el totalCantidadPorPrecio excede el máximo permitido por mediumint(9)
                if (totalCantidadPorPrecio > 8388607) { // 8388607 es el valor máximo para mediumint(9) sin signo
                    return {
                        status: 400,
                        mensaje: `El total para el producto ${producto.idProducto} excede el máximo permitido y no se puede guardar.`
                    };
                }
    
                return {
                    idRecibo,
                    idProducto: producto.idProducto,
                    cantidadProductosComprados: producto.cantidadProductosComprados,
                    totalCantidadPorPrecio,
                };
            }));
    
            // Filtrar cualquier producto que haya excedido el límite
            const productosValidos = productosFormateados.filter(producto => producto.status !== 400);
    
            if (productosValidos.length === 0) {
                return {
                    status: 400,
                    mensaje: 'Ningún producto pudo ser agregado debido a límites excedidos.'
                };
            }
    
            await db.agregar(TABLA, productosValidos);
            return {
                status: 201,
                mensaje: `Recibo ${idRecibo} creado exitosamente con sus productos.`,
            };
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                // Manejar el error de duplicado aquí
                console.log(`Advertencia: Duplicado ignorado - ${err.message}`);
                return {
                    status: 201,
                    mensaje: `Recibo ${idRecibo} creado exitosamente. Los duplicados fueron ignorados.`,
                };
            } else {
                throw err; // Re-lanzar otros errores
            }
        }
    }
    
    
    
    

    function todos() {
        return db.todos(TABLA);
    }

    function uno(id) {
        return db.uno(TABLA, id);
    }

    function actualizar(body) {
        return db.actualizar(TABLA, body);
    }

    function eliminar(body) {
        return db.eliminar(TABLA, body);
    }

    return {
        todos,
        uno,
        agregar,
        actualizar,
        eliminar,
    };
}
