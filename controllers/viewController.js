
const Tour=require("../models/tourModel");
const catchAsync=require("../utils/catchAsync");
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

exports.getTour=catchAsync(async(req,res)=>{
    // 1) Get tour data
    let tour=await Tour.find({slug:req.params.slug}).populate({
        path:"reviews",
        fields:"review rating user"
    });



   tour=tour[0]

   console.log(tour)

    // const tour=await Tour.find({slug:req.params.slug});

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