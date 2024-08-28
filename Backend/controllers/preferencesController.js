const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.user_sortBy = [
  body("sortBy").trim().escape(),

  asyncHandler(async (req, res) => {
    req.session.sortBy = req.body.sortBy;
    res.status(200).json({ sortBy: req.session.sortBy });
  }),
];

exports.user_getSortBy = asyncHandler(async (req, res) => {
  res.status(200).json({ sortBy: req.session.sortBy });
});
