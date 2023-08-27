var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");

/* GET users listing. */
router.post("/create", userController.create_user);

router.post("/login", function (req, res, next) {
  console.log("works!");
  res.json({ test: "test" });
});

module.exports = router;
