
const Tour=require("../models/tourModel");
const User=require("../models/userModel");
const catchAsync=require("../utils/catchAsync");
const AppError=require("./../utils/appError");

exports.getOverview=catchAsync(async(req,res)=>{
    // 1) Get Tour Data Collection
        const tours=await Tour.find();


    // 2) Build Template

    // 3) Render the Template


    res.status(200).render("overview",{
        title:"All Tours",
        tours
    });
});

exports.getTour=catchAsync(async(req,res,next)=>{
    // 1) Get tour data
    let tour=await Tour.find({slug:req.params.slug}).populate({
        path:"reviews",
        fields:"review rating user"
    });

    tour=tour[0];

    if(!tour){
        return next(new AppError("There is no tour with that name",404))
    }

    // 2) Build Template

    // 3) Render Template
    res.status(200).render("tour",{
        title: `${tour.name} Tour`,
        tour
    });
})

exports.getloginForm=(req,res)=>{
    res.status(200).render("login",{
        title:"Login"
    });
}
exports.myAccount=(req,res)=>{
    res.status(200).render("account",{
        title:"My account"
    })
}

exports.updateUserData=catchAsync(async(req,res,next)=>{
    const updatedUser=await User.findByIdAndUpdate(req.user,{
        name:req.body.name,
        email:req.body.email
    },{
        new:true,
        runValidators:true
    });


    res.status(200).render("account",{
        title:"My account",
        user:updatedUser
    })
})