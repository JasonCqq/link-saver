var express = require("express");
var router = express.Router();
const isAuthenticated = require("../app");

router.get("/check", function (req, res) {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.json(null);
  }
});

// router.get("/", function (req, res) {
//   res.send("test");
// });

module.exports = router;
