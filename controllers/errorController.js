
const  AppError=require("./../utils/appError");

const handleDuplicateFieldsDB=err=>{
    const value=err.errmsg.match(/([""])(\\?.)*?\1/)[0]
    const message=`Duplicate field value: x. Please use another value`;
    console.log(value)
    return new AppError(message,400);
}
// Development Error:Send back every detail of the error
const sendErrorDev=(err, res)=>{
    
    res.status(err.statusCode).json({
        status: err.status,
        error:err,
        message:err.message,
        stack:err.stack
    })
}

// Production Error: Send friendly message to the client
const sendErrorProd=(err,res)=>{
    
    // Operartional Error
    if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message,
        })
    
    }else{
    // Programming Error
    re.status(500).json({
        status:"error",
        message:"Something went very wrong"
    })

    }
}



module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.status=err.status || "error";

    if(process.env.NODE_ENV === "development"){
        console.log("Development error response")
        sendErrorDev(err,res)
    }else if(process.env.NODE_ENV === "production"){
        console.log("Production error response")
        let error={...err}
        // Handling duplicate key errors 
        if(error.code === 11000) error= handleDuplicateFieldsDB(error)
        sendErrorProd(error,res)
    }
}