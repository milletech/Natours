
const express=require("express");
const viewController=require("../controllers/viewController");
const authController=require("../controllers/authController");
const router=express.Router();


router.route("/").get(viewController.getOverview);
router.route("/tour/:slug").get(authController.protect,viewController.getTour);

router.route("/login").get(viewController.getloginForm)

module.exports=router;

