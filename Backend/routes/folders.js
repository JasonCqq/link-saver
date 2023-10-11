var express = require("express");
var router = express.Router();
const foldersController = require("../controllers/foldersController");

router.get("/:userId", foldersController.get_folder);

module.exports = router;
