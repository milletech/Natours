
const catchAsync = require("../utils/catchAsync");
const User=require("./../models/userModel");
const APIFeatures=require("./../utils/apiFeatures");
const AppError=require("./../utils/appError");
const factory=require("./handlerFactory");

const filterObj=(obj, ...allowedFields)=>{
    const newObj={};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
}


exports.updateMe=catchAsync(async(req,res,next)=>{

    // 1) Create error if user POST password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError("This route is not for password update",400))
    }
    // 2) Update the user document
    const filteredBody=filterObj(req.body, "name","email")


    const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    });
 
    res.status(200).json({
        status:"success",
        data:{
            user:updatedUser
        }
    })

    // 3) 
});

exports.getMe=(req,res,next)=>{
    req.params.id=req.user.id;
    next();
}


exports.deleteMe=catchAsync(async (req,res,next)=>{

    await User.findByIdAndUpdate(req.user.id,{active:false});

    res.status(204).json({
        status:"Success",
        data:null
    })
})


exports.createUser=(req,res)=>{
    res.status(500).json({
        status:"Error",
        message:"This route has not been implemented"
    })
}
exports.getUser=factory.getOne(User)
exports.getAllUsers=factory.getAll(User)
// Do Not update passwords with this
exports.updateUser=factory.updateOne(User)
exports.deleteUser=factory.deleteOne(User);
