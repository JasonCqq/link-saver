var express = require("express");
var router = express.Router();
const urlController = require("../controllers/urlController");

router.get("/:userId", urlController.get_urls);

const securityCheck = require("../routes/routeAuthenticate");
router.use(securityCheck.authenticateReq);

router.post("/create", urlController.create_urls);

router.delete("/delete", urlController.delete_urls);

router.delete("/deleteAll", urlController.deleteAll_urls);

router.put("/update", urlController.update_url);

module.exports = router;
