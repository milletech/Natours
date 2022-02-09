const mongoose=require("mongoose");


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


// Query Middleware

reviewSchema.pre(/^find/,function(next){
    // this.populate({
    //     path:"tour",
    //     select:"name"

    // }).populate({
    //     path:"user"
    // })

    this.populate({
        path:"user",
        select:"name photo"
    })

    next();
})
const Review=mongoose.model("Review", reviewSchema);

module.exports=Review;