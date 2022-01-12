const mongoose=require("mongoose");
const slugify=require("slugify")

// Schema
const tourSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true, "A tour must have a name"],
        unique:true
    },
    slug:String,
    duration:{
        type:Number,
        required:[true, "A tour must have a duration"]

    },
    maxGroupSize:{
        type:Number,
        required:[true, "A tour must have a group size"]
    },
    difficulty:{
        type:String,
        required:[true, "A tour must have a difficulty"]
    },
    ratingsAverage:{
        type:Number,
        default:4.5
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true, "A tour must have a price"]
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                // this keyword only point to the current doc on the NEW document creation
                return val< this.price
            },
            message:"Discount price should be below regular price"
        }
    },
    summary:{
        type:String,
        trim:true,
        required:[true, "A tour must have a description"]

    },
    description:{
        type:String,
        trim:true 
    },
    imageCover:{
        type:String,
        required:[true, "A tour must have a cover image"]
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[String]
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

tourSchema.virtual("durationWeeks",function(){
    return this.duration/7;
})

// Document Middleware: Functions that runs before the document is saved

tourSchema.pre("save", function(next){
    this.slug=slugify(this.name, {lower:true});
    next()
});

const Tour=mongoose.model("Tour",tourSchema);

module.exports=Tour;
