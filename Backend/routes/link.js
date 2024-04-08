var express = require("express");
var router = express.Router();
const linkController = require("../controllers/linkController");

router.post("/create/:userId", linkController.create_link);

router.get("/links/:userId", linkController.get_links);

router.put("/delete/:id/:userId", linkController.delete_link);

router.delete("/deleteAll/:userId", linkController.perma_delete_all);

router.put("/restore/:id/:userId", linkController.restore_link);

router.put("/edit/:id/:userId", linkController.edit_link);

router.delete("/perma_delete/:id/:userId", linkController.perma_delete_link);

router.get("/search/:userId", linkController.search_link);

module.exports = router;
