
const express=require("express");
const app = require("../app");
const tourController=require("./../controllers/tourController")
const router=express.Router();


router.route("/top-5-cheap").get(tourController.topCheap,tourController.getAllTours);
router.route("/tour-stats").get(tourController.getTourStats)
router.route("/monthly-plan/:year").get(tourController.monthlyTours)
router.route("/").get(tourController.getAllTours).post(tourController.createTour);
router.route("/:id").get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);


module.exports=router;