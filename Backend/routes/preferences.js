var express = require("express");
var router = express.Router();
const preferencesController = require("../controllers/preferencesController");
const securityCheck = require("./routeAuthenticate");

function checkPreference(req, res, next) {
  if (!req.sortBy) {
    req.sortBy = "Latest";
  }
  next();
}

router.get("/sortBy", checkPreference, preferencesController.user_getSortBy);

router.use(securityCheck.authenticateReq);
router.post("/sortBy", preferencesController.user_sortBy);

module.exports = router;
