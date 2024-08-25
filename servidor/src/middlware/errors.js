function error (mensaje, code){
    let e = new Error(mensaje);

    if (code){
        e.StatusCode = code;

    }
    return e;
}

module.exports = error;
