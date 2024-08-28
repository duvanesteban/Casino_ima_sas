const express = require('express');
const path = require('path');
const config = require('./config.js');
const morgan = require('morgan');
const cors = require('cors');
const productos = require('./modulos/productos/rutas.js');
const usuarios = require('./modulos/usuarios/rutas.js');
const tablaintermediaproductorecibo = require('./modulos/tablaintermediaproductorecibo/rutas.js');
const error = require('./red/errores.js');


const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.set('port', config.app.port);


app.use('/productos', productos);
app.use('/usuarios', usuarios);
app.use('/tablaintermediaproductorecibo', tablaintermediaproductorecibo);

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON');
        return res.status(400).send({ message: 'Solicitud malformada: JSON incorrecto.' });
    }
    // Puedes manejar otros tipos de errores aquí
    next();
});

module.exports = app;
