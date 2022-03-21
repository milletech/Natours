
const AppError=require("./../utils/appError");

const handleCastErrorDB=err=>{
    const message=`Invalid ${err.path}: ${err.value}`;
    return new AppError(message,400)
}

const handleDuplicateFieldsDB=err=>{
    const value=err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    // console.log(value)
    const message=`Duplicate field value:${value}.Please use another value`;
    return new AppError(message,400)
}

const handleValidationErrorDB=err=>{
    const errors=Object.values(err.errors).map(el=>el.message);
    const message=`Invalid input data ${errors.join(". ")}`;
    return new AppError(message,400)
}

const handleJWTError=err=>new AppError("Invalid token. Please log in again!",401);

const handleJWTExpiredError=err=>new AppError("Your token has expired! Please login again",401)

const sendErrorDev=(err, req, res)=>{

    // API
    // .log(req.originalUrl)
    if(req.originalUrl.startsWith('/api')){
        res.status(err.statusCode).json({
            status: err.status,
            error:err,
            message:err.message,
            stack:err.stack
        })

    }else{
        // RENDERED WEBSITE
        res.status(err.statusCode).render("error",{
            title:"Something went wrong",
            msg:err.message
        })

    }

}

const sendErrorProd=(err,req, res)=>{
    // Operational Error

    if(req.originalUrl.startsWith('/api')){
        // API
        if(err.isOperational){
            res.status(err.statusCode).json({
                status: err.status,
                message:err.message
            })
    
        // Programming error
        }else{
            // console.error(err)

            res.status(500).json({
                status:"error",
                message:"Something went very wrong"
            })
        }

    }else{
        // RENDERED WEBSITE
        res.status(err.statusCode).render("error",{
            title:"Something went wrong",
            msg:err.message
        })
    }


}



module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.status=err.status || "error";

    if(process.env.NODE_ENV === "development"){
        sendErrorDev(err,req,res)
    }else if(process.env.NODE_ENV === "production"){
        if(err.name === "CastError") err=handleCastErrorDB(err);
        if(err.code === 11000) err=handleDuplicateFieldsDB(err);
        if(err.name === "ValidationError") err=handleValidationErrorDB(err);
        if(err.name === "JsonWebTokenError") err=handleJWTError(err);
        if(err.name === "TokenExpiredError") err=handleJWTExpiredError(err);

        sendErrorProd(err,req,res)
    }
}