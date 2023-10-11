const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
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
      // Checks for existing users
      const existCheck = await prisma.User.findUnique({
        where: {
          email: req.body.email,
          username: req.body.username,
        },
      });

      if (existCheck) {
        return res.json({ errors: "User already exists" });
      }

      // Hash Password
      bcrypt.hash(req.body.password, 10, async (err, hashedPass) => {
        if (err) {
          return res.status(500).json({
            error: "Error Hashing Password. (Bcrypt Error)",
            oldData: {
              username: req.body.username,
              email: req.body.email,
              password: req.body.password,
            },
          });
        }

        await prisma.$transaction(async (prisma) => {
          let folderId;
          const defaultFolder = await prisma.Folder.create({
            data: {
              name: "default",
            },
          });
          folderId = defaultFolder.id;

          const user = await prisma.User.create({
            data: {
              username: req.body.username,
              email: req.body.email,
              password: hashedPass,
              folders: {
                connect: {
                  id: folderId,
                },
              },
            },
          });

          const connectFolder = await prisma.Folder.update({
            where: {
              id: folderId,
            },
            data: {
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        });

        return res.json({ success: true });
      });
    }
  }),
];

exports.login_user = [
  body("username").trim().escape(),
  body("password", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      return res.json({ errors: errs.array().map((error) => error.msg) });
    }

    try {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.json({ success: false, message: info.message });
        } else {
          const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
          };

          req.session.user = userData;

          console.log(req.session.user);
          return res.json({ user: req.session.user });
        }
      })(req, res, next);
    } catch (err) {
      console.log(err);
    }
  }),
];

exports.logout_user = asyncHandler(async (req, res) => {
  req.session = null;
  res.json({ success: true, message: "User session deleted" });
});
