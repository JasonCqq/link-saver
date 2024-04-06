var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");

router.post("/create", userController.create_user);

router.post("/login", userController.login_user);

router.get("/logout", userController.logout_user);

router.get("/settings/:userId", userController.get_settings);

router.put("/submit_settings/:userId", userController.submit_settings);

router.delete("/delete_account/:userId", userController.delete_user);

router.put("/change_password/:userId", userController.change_password);

router.post("/forgot_password", userController.forgot_password);

router.post("/check_otp", userController.check_otp);

router.put("/new_password_otp", userController.change_password_otp);

module.exports = router;
