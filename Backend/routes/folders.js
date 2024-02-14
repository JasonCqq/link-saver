var express = require("express");
var router = express.Router();
const foldersController = require("../controllers/foldersController");

router.get("/", foldersController.get_folder);

router.post("/create", foldersController.create_folder);

router.get("/:userId", foldersController.get_folder);

module.exports = router;
