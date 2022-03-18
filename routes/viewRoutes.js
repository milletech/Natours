
const express=require("express");
const viewController=require("../controllers/viewController");
const authController=require("../controllers/authController");
const bookingController=require("../controllers/bookingController");
const router=express.Router();



router.route("/me").get(authController.protect, viewController.myAccount);
router.route("/my-tours").get(authController.protect, viewController.getMyTours);
router.route("/submit-user-data").post(authController.protect, viewController.updateUserData);

router.use(authController.isLoggedIn)
router.route("/").get(bookingController.createBookingCheckout, viewController.getOverview);
router.route("/tour/:slug").get(viewController.getTour);
router.route("/login").get(viewController.getloginForm)


module.exports=router;

