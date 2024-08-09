var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const otpController = require("../controllers/otpController");

router.get("/create/:email/:otp", userController.create_user);

router.get("/logout", userController.logout_user);

router.get("/settings/:userId", userController.get_settings);

router.post("/login", userController.login_user);

// Forgot Password Process
router.post("/forgot_password", otpController.generateOTP);

router.post("/verify_otp", otpController.verifyOTP);

router.post("/change_password_otp", userController.change_password_otp);

router.post("/createOTPLink", otpController.generateOTPLink);

const securityCheck = require("../routes/routeAuthenticate");
router.use(securityCheck.authenticateReq);

router.put("/submit_settings", userController.submit_settings);

router.delete("/delete_account", userController.delete_user);

router.put("/change_password", userController.change_password);

module.exports = router;
