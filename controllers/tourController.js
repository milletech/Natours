const Tour=require("./../models/tourModel")
const AppError=require("./../utils/appError");
const factory=require("./handlerFactory");

const catchAsync=require("./../utils/catchAsync")


// Function Handlers
exports.topCheap=(req,res,next)=>{
    req.query.sort="-ratingsAverage,price";
    req.query.limit="5";
    req.query.fields="name,price,difficulty,ratingsAverage";
    next()
}

exports.getAllTours=factory.getAll(Tour)
exports.getTour=factory.getOne(Tour,{path:"reviews"});
exports.createTour=factory.createOne(Tour);
exports.updateTour=factory.updateOne(Tour);
exports.deleteTour=factory.deleteOne(Tour)


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

exports.getToursWithin=catchAsync(async(req,res,next)=>{
    const {distance,latlng,unit}=req.params;
    const [lat,lng]=latlng.split(",");

    const radius=unit==="mi"?distance/3963.2:distance/6378.1;
    if(!lat || !lng){
        return next(new AppError("Please provide your line if latitude and longitude",400))
    }

    const tours=await Tour.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}})

    res.status(200).json({
        status:"success",
        results:tours.length,
        data:{
            data:tours
        }
    })
});

exports.getDistances=catchAsync(async(req,res,next)=>{
    const {latlng,unit}=req.params;
    const [lat,lng]=latlng.split(",");

    const multiplier=unit==="mi"? 0.000621371:0.01;

    if(!lat || !lng){
        return next(new AppError("Please provide your line if latitude and longitude",400))
    }

    // Geospatial aggregation pipeline
    const distances=await Tour.aggregate([
        {
            // GeoNear Must Always Be the First Step in the Geospatial aggregation pipeline
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:[lng*1,lat*1]
                },
                distanceField:"distance",
                distanceMultiplier:multiplier
            }
        },
        {
            $project:{
                distance:1,
                name:1
            }
        }
    ])


    res.status(200).json({
        status:"Success",
        data:{
            data:distances
        }
    })

})