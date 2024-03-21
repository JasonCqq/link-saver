var express = require("express");
var router = express.Router();
const homeController = require("../controllers/homeController");

router.get("/check", homeController.user_check);

router.get("/stat", homeController.stat_check);

module.exports = router;
