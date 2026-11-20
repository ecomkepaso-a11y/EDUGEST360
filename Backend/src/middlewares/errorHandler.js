const errorHandler=(err,req,res,next)=>{
    console.error(err)

    res.status(err.status||500).json({
        success:false,
        message:err.message|| "Internal Server Error",
        ...(err.details && { details: err.details })
    })


}

export default errorHandler