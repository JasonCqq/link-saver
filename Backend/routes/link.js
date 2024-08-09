var express = require("express");
var router = express.Router();
const linkController = require("../controllers/linkController");

router.get("/links/:userId", linkController.get_links);

router.get("/search/:userId", linkController.search_link);

const securityCheck = require("../routes/routeAuthenticate");
router.use(securityCheck.authenticateReq);

router.post("/create", linkController.create_link);

router.put("/delete", linkController.delete_link);

router.delete("/deleteAll", linkController.perma_delete_all);

router.put("/restore", linkController.restore_link);

router.put("/edit", linkController.edit_link);

router.delete("/perma_delete", linkController.perma_delete_link);

router.put("/mass_edit", linkController.mass_edit_links);

router.put("/mass_restoreDelete", linkController.mass_restore_delete_links);

module.exports = router;
