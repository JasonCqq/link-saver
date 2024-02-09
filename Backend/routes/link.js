var express = require("express");
var router = express.Router();
const linkController = require("../controllers/linkController");

router.post("/create", linkController.create_link);

router.get("/links", linkController.get_links);

router.get("/bookmarks", linkController.get_bookmarks);

router.get("/upcoming", linkController.get_upcoming);

router.get("/trash", linkController.get_trash);

router.put("/delete", linkController.delete_link);

router.delete("/perma_delete/:id", linkController.perma_delete_link);

module.exports = router;
