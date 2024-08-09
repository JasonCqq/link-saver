const asyncHandler = require("express-async-handler");

exports.authenticateReq = asyncHandler(async (req, res, next) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json("Not authenticated!");
  } else {
    next();
  }
});
