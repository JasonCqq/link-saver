const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const prisma = require("../prisma/prismaClient");

require("dotenv").config();

exports.create_user = [
  body("username").trim().escape(),
  body("email", "Invalid Email").trim().isEmail().escape(),
  body("password", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      res.status(400).json({ errors: errs.array().map((error) => error.msg) });
    } else {
      const userCheck = await prisma.User.findUnique({
        where: {
          email: req.body.email,
          username: req.body.username,
        },
      });

      const currentDate = new Date();

      if (userCheck) {
        res.status(400).json({ errors: "User already exists" });
      }

      // Hash Password
      bcrypt.hash(req.body.password, 10, async (err, hashedPass) => {
        if (err) {
          res.status(500).json({
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
              userSettings: {
                create: {},
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

        res.status(200).json({});
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
      res.status(400).json({ errors: errs.array().map((error) => error.msg) });
    }

    try {
      passport.authenticate("local", async (err, authenticated, info) => {
        if (err) {
          return next(err);
        }
        if (!authenticated) {
          res.status(400).json({ message: info.message });
        } else {
          const user = await prisma.User.findUnique({
            where: {
              id: authenticated.id,
            },
            include: {
              userSettings: true,
            },
          });

          const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            creationDate: user.creationDate,
          };

          req.session.user = userData;
          req.session.save(function (err) {
            if (err) return next(err);
            res
              .status(200)
              .json({ user: userData, settings: user.userSettings });
          });
        }
      })(req, res, next);
    } catch (err) {
      console.log(err);
    }
  }),
];

exports.logout_user = asyncHandler(async (req, res) => {
  req.session.user = null;

  req.session.save(function (err) {
    if (err) next(err);
    req.session.regenerate(function (err) {
      if (err) next(err);
      res.status(200).json({});
    });
  });
});

exports.get_settings = [
  asyncHandler(async (req, res) => {
    const userSettings = await prisma.UserSettings.findUnique({
      where: {
        userId: req.params.userId,
      },
    });
    res.status(200).json({ settings: userSettings });
  }),
];

exports.submit_settings = [
  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      res.status(400).json({ errors: errs.array().map((err) => err.msg) });
    } else {
      console.log(req.body, typeof req.body.previews);
      const userSettings = await prisma.UserSettings.update({
        where: {
          userId: req.params.userId,
        },

        data: {
          previews: req.body.previews,
          emailNotifications: req.body.emailNotifications,
        },

        include: { user: true },
      });

      res.status(200).json({ user: userSettings.user, settings: userSettings });
    }
  }),
];
