const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
// const bcrypt = require("bcrypt");
// const passport = require("passport");
const prisma = require("../prisma/prismaClient");

exports.create_user = [
  body("username").trim().escape(),
  body("email").trim().isEmail().escape(),
  body("password", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      return res.json({ errors: errs.array().map((error) => error.msg) });
    } else {
      const user = await prisma.user.create({
        data: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
        },
      });

      return res.json(user);
    }
  }),
];

exports.login_user = [
  body("username").trim().escape(),
  body("password", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      return res.json({ errors: errs.array().map((error) => error.msg) });
    } else {
      // To Be Determined
      // const user = await;
      // return res.json(user);
    }
  }),
];
