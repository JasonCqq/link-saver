var express = require("express");
var router = express.Router();
const linkController = require("../controllers/linkController");

router.post("/create", linkController.create_link);

module.exports = router;
