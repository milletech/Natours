
const express=require("express");
const app = require("../app");
const tourController=require("./../controllers/tourController");
const authController=require("./../controllers/authController");
const reviewController=require("./../controllers/reviewController")
const router=express.Router();


router.route("/top-5-cheap").get(tourController.topCheap,tourController.getAllTours);
router.route("/tour-stats").get(tourController.getTourStats)
router.route("/monthly-plan/:year").get(tourController.monthlyTours)
router.route("/").get(authController.protect,tourController.getAllTours).post(tourController.createTour);
router.route("/:id").get(tourController.getTour).patch(tourController.updateTour).delete(authController.protect,authController.restrictTo("admin","lead-guide"),tourController.deleteTour);


// POST tours/tourId/reviews
// Get tours/tourID/reviews
router.route("/:tourId/reviews").
post(authController.protect,authController.
restrictTo("user"),reviewController.createReview).
get(reviewController.getAllReviews)

module.exports=router;