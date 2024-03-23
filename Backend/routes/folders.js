var express = require("express");
var router = express.Router();
const foldersController = require("../controllers/foldersController");

router.get("/:userId", foldersController.get_folder);

router.post("/create/:userId", foldersController.create_folder);

router.put("/edit/:folderId/:userId", foldersController.edit_folder);

router.get(
  "/search_link/:folderId/:userId",
  foldersController.search_folder_links,
);

router.delete("/delete/:folderId/:userId", foldersController.delete_folder);

module.exports = router;
