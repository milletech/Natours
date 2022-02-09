const fs=require("fs");
const Tour=require("./../models/tourModel")
const APIFeatures=require("./../utils/apiFeatures");
const AppError=require("./../utils/appError");

const catchAsync=require("./../utils/catchAsync")


// Function Handlers
exports.topCheap=(req,res,next)=>{
    req.query.sort="-ratingsAverage,price";
    req.query.limit="5";
    req.query.fields="name,price,difficulty,ratingsAverage";
    next()
}


exports.getAllTours=catchAsync(async(req,res,next)=>{
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
})
exports.getTour=catchAsync(async(req,res,next)=>{

    const tour=await Tour.findById(req.params.id).populate("reviews")

    if(!tour) {
        return next(new AppError("Not tour found with that ID",404))
    }
    res.status(200).json({
        status:"success",
        data:{
            tour
        }
    })
})

exports.createTour=catchAsync(async (req,res,next)=>{
    const newTour=await Tour.create(req.body)
    res.status(201).json({
    status:"Sucess",
    data:{
        tour:newTour
    }})
})

exports.updateTour=catchAsync(async (req,res,next)=>{

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
})

exports.deleteTour=catchAsync(async (req,res,next)=>{

    const tour=await Tour.findByIdAndDelete(req.params.id)
    if(!tour) {
        return next(new AppError("Not tour found with that ID",404))
    }
    res.status(204).json({
        status:"success",
        data:null
    })
})

exports.getTourStats=catchAsync(async (req,res,next)=>{
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
})

exports.monthlyTours=catchAsync(async (req,res,next)=>{
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
    ]);

    res.status(200).json({
        status:"Sucess",
        year,
        data:{
            plan
        }
    })
})