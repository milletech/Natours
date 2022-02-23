const mongoose=require("mongoose");
const Tour=require("./tourModel");


const reviewSchema=new mongoose.Schema({
    reviewText:{
        type:String,
        trim:true,
        required:[true, 'A review must have a text']
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:"Tour"
    },

    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    }
},
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
)


reviewSchema.index({ tour:1 , user:1 },{ unique:true })


// Query Middleware

reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:"user",
        select:"name photo"
    })

    next();
})

reviewSchema.statics.calcAverageRatings=async function(tourId){
    const stats=await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg: '$rating'}
            }
        }

    ]);
    console.log(stats);

    await Tour.findByIdAndUpdate(tourId,{ratingsAverage:stats[0].avgRating,ratingsQuantity:stats[0].nRating})
}

// Post document middleware function doesn't have access to next
reviewSchema.post("save", function(){
    this.constructor.calcAverageRatings(this.tour);
})

// findByIdAndUpdate
// findByIdAndDelete

// Pre query middleware function
reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r=await this.findOne();
    console.log(this.r);
    next()
})

// Post query middleware
reviewSchema.post(/^findOneAnd/,async function(){
    // await this.findOne(); does not work, the query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour)
})


const Review=mongoose.model("Review", reviewSchema);

module.exports=Review;

// the-strongest-and-most-secured-secret