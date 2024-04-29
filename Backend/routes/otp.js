var express = require("express");
var router = express.Router();
const otpController = require("../controllers/otpController");

router.post("/generate_otp", otpController.generateOTP);
router.post("/verify_otp", otpController.verifyOTP);

module.exports = router;
