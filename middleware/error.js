const errorResponse = require ('../utils/errorResponse')
const errorHandler = (err, req, res, next) => {
	let error = {...err}
	error.message=err.message;
    //log to console.log
    console.log(err);
    // console.log(err.name.red);
    if(err.name === 'CastError'){
    	const message = `Resource not found with id of ${err.value}`
    	error =		new errorResponse (message,'404')	
    }
    //mongoose Dublicate error key
    if(err.code === 11000){
    	const message = "Dublicate filed entered";
    	error = new errorResponse (message,'400');
    }
    //mongoose valdiation error
    if(err.name === 'ValidationError'){
    	const message	=Object.values(err.errors).map(val => val.message);
    	// basically what he says hear is for each value find me value.message
    	error = new errorResponse (message,'400');
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};
module.exports = errorHandler;