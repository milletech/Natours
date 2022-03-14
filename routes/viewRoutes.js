
const express=require("express");
const viewController=require("../controllers/viewController");
const authController=require("../controllers/authController");
const router=express.Router();



router.route("/me").get(authController.protect, viewController.myAccount);
router.route("/submit-user-data").post(authController.protect, viewController.updateUserData);

router.use(authController.isLoggedIn)
router.route("/").get(viewController.getOverview);
router.route("/tour/:slug").get(viewController.getTour);
router.route("/login").get(viewController.getloginForm)


module.exports=router;

