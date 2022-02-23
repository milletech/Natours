
const Review=require("./../models/reviewModel");
const catchAsync=require("./../utils/catchAsync");
const factory=require("./handlerFactory");



// Create review

exports.setTourUserIds=(req,res,next)=>{
    // Allow nested route
    if(!req.body.tour) req.body.tour=req.params.tourId;
    if(!req.body.user) req.body.user=req.user.id;
    next()
}
exports.createReview=factory.createOne(Review)

// Get all reviews
exports.getAllReviews=factory.getAll(Review)

// Get Review
exports.getReview=factory.getOne(Review);

// Update Review
exports.updateReview=factory.updateOne(Review);

// Delete Review
exports.deleteReview=factory.deleteOne(Review);


