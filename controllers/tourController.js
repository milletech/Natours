const fs=require("fs");
const Tour=require("./../models/tourModel")
const APIFeatures=require("./../utils/apiFeatures");
const AppError=require("./../utils/appError");


// Function Handlers
exports.topCheap=(req,res,next)=>{
    req.query.sort="-ratingsAverage,price";
    req.query.limit="5";
    req.query.fields="name,price,difficulty,ratingsAverage";
    next()
}


exports.getAllTours=async(req,res)=>{

    try{
        const features=new APIFeatures(Tour.find(),req.query).filter().limitFields().paginate()
        const tours=await features.query;

        // Send Response
        res.status(200).json({
            status:"success",
            results:tours.length,
            data:{
                tours
            }
        })
    }catch(err){
        res.status(404).json({
            status:"failed",
            message:err
        })
    }

}
exports.getTour=async(req,res,next)=>{

    try{
        const tour=await Tour.findById(req.params.id);

        if(!tour) {
            return next(new AppError("Not tour found with that ID",404))
        }
        res.status(200).json({
            status:"success",
            data:{
                tour
            }
        })
    }catch(err){
        res.status(404).json({
            status:"failed",
            message:err
        }) 
    }


}

exports.createTour=async (req,res)=>{

    try{
        const newTour=await Tour.create(req.body)
        res.status(201).json({
        status:"Sucess",
        data:{
            tour:newTour
        }})
    }catch(err){
        res.status(400).json({
            status:"Failed",
            message:err
        })
    }
}

exports.updateTour=async (req,res)=>{

    try{
        const tour=await Tour.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
        if(!tour) {
            return next(new AppError("Not tour found with that ID",404))
        }
        res.status(200).json({
            status:"success",
            data:{
                tour
            }
        })
    }catch(err){
        res.status(400).json({
            status:"Failed",
            message:err
        })
    }


}

exports.deleteTour=async (req,res)=>{

    try{
        const tour=await Tour.findByIdAndDelete(req.params.id)
        if(!tour) {
            return next(new AppError("Not tour found with that ID",404))
        }
        res.status(204).json({
            status:"success",
            data:null
        })
    }catch(err){
        res.status(404).json({
            status:"Failed",
            message:err
        })
    }
}

exports.getTourStats=async (req,res)=>{
    try{
        const stats=await Tour.aggregate([
            {   
                // Filter
                $match:{ratingsAverage:{$gte:4.5}}
            },
            {
                // Group
                $group:{
                    _id:'$difficulty',
                    numTours:{ $sum: 1},
                    avgRating: { $avg: '$ratingsAverage'},
                    avgPrice:{$avg: '$price'},
                    minPrice:{$min: '$price'},
                    maxPrice:{$max:'$price'}
                }
            },{
                // Sort
                $sort:{avgPrice:1}
            }
        ])
        res.status(200).json({
            status:"Sucess",
            data:{
                stats
            }})
    }catch(err){
        res.status(404).json({
            status:"Failed",
            message:err
        })
    }
}

exports.monthlyTours=async (req,res)=>{
    const year=req.params.year*1;
    const plan=await Tour.aggregate([
        {
            $unwind:"$startDates"
        },
        {
            $addFields: {
                startYear: { $year: '$startDates' },
                startMonth: { $month: '$startDates' }
            }
        },
        {
            $match: {
                startYear: { $eq: year }
            }
        },
        {
            $group:{
                _id:{$month:'startDates'}
            }
        }
    ])
    try{
        res.status(200).json({
            status:"Sucess",
            year,
            data:{
                plan
            }
        })
    }catch(err){
        res.status(404).json({
            status:"Failed",
            message:err
        })
    }
}