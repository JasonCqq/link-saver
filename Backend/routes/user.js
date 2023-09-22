var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");

/* GET users listing. */
router.post("/create", userController.create_user);

router.post("/login", userController.login_user);

// router.post("/logout", userController.logout_user);

module.exports = router;
