require('dotenv').config();

module.exports = { // Exporta un objeto que contiene la configuración de la aplicación.
    app: {
        port: process.env.PORT || 3002, // El puerto en el que la aplicación se ejecutará. Si hay una variable de entorno PORT definida, se usará ese valor. De lo contrario, se utilizará el valor predeterminado 
    },
    jwt:{
        secret: process.env.JET_SECRET || 'notaSecreta!',
    },
    mysql: {
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER ||'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DB || 'casinoimasas'
    }
}