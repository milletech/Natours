
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

exports.getTour=(req,res)=>{
    res.status(200).render("tour",{
        title:"Tour Details"
    });
}