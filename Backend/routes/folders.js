var express = require("express");
var router = express.Router();
const foldersController = require("../controllers/foldersController");

router.get("/public/:id", foldersController.get_shared_folder);

router.post("/public/:id", foldersController.get_authorized_folder);

const securityCheck = require("../routes/routeAuthenticate");
router.use(securityCheck.authenticateReq);

router.get("/:userId", foldersController.get_folder);

router.get(
  "/search_link/:folderId/:userId",
  foldersController.search_folder_links
);

router.post("/create", foldersController.create_folder);

router.put("/edit", foldersController.edit_folder);

router.delete("/delete", foldersController.delete_folder);

router.post("/share", foldersController.create_shared_folder);

router.put("/unshare", foldersController.unshare_folder);

module.exports = router;
