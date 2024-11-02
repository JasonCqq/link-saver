const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const prisma = require("../prisma/prismaClient");

require("dotenv").config();

exports.create_user = [
  body("username").trim().escape(),
  body("password", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),
  body("email", "Invalid Email").trim().isEmail().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      const existingUser = await prisma.user.findMany({
        where: {
          OR: [{ email: req.body.email }, { username: req.body.username }],
        },
      });

      let error = null;

      if (existingUser.length > 0) {
        if (existingUser.some((user) => user.email === req.body.email)) {
          error = "Email already in use";
        } else if (
          existingUser.some((user) => user.username === req.body.username)
        ) {
          error = "Username already in use";
        }
      }

      if (error) {
        res.status(500).json(error);
      } else {
        try {
          bcrypt.hash(req.body.password, 10, async (err, hashedPass) => {
            if (err) {
              res.status(500).json({
                errors: "Error Hashing Password. (Bcrypt Error)",
              });
            }

            // Copy tempUser data
            const newUser = await prisma.User.create({
              data: {
                username: req.body.username,
                email: req.body.email,
                password: hashedPass,
                folders: {
                  create: {
                    name: "Default",
                  },
                },
                userSettings: {
                  create: {},
                },
              },
            });

            // Default User stuff
            const newFolder = await prisma.Folder.findFirst({
              where: {
                userId: newUser.id,
                name: "Default",
              },
            });
            const newShare = await prisma.Share.create({
              data: {
                folder: {
                  connect: {
                    id: newFolder.id,
                  },
                },

                user: {
                  connect: {
                    id: newUser.id,
                  },
                },
              },
            });
            const newUserSettings = await prisma.UserSettings.findFirst({
              where: {
                userId: newUser.id,
              },
            });

            // Attach data to session
            const userData = {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              creationDate: newUser.creationDate,
            };
            req.session.user = userData;
            res.status(200).json({ user: userData, settings: newUserSettings });
          });
        } catch (err) {
          console.log(err);
        }
      }
    }
  }),
];

exports.login_user = [
  body("username").trim().escape(),
  body("password", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),

  async (req, res, next) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      passport.authenticate("local", async (err, authenticated, info) => {
        if (err) {
          return next(err);
        }
        if (authenticated === false) {
          res.status(400).json(info.message);
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
          res.status(200).json({ user: userData, settings: user.userSettings });
        }
      })(req, res, next);
    }
  },
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

exports.delete_user = [
  body("userID").trim().escape(),
  body("password").trim().escape(),

  asyncHandler(async (req, res) => {
    const user = await prisma.User.findUnique({
      where: {
        id: req.body.userID,
      },
    });

    const check = await bcrypt.compare(req.body.password, user.password);

    if (!check) {
      res.status(401).json("Not authenticated");
    } else {
      await prisma.User.delete({
        where: {
          id: req.body.userID,
        },
      });

      req.session.destroy((err) => {
        if (err) {
          res.status(500).json("Internal Server Error");
        }
      });

      res.status(200).json({});
    }
  }),
];

exports.get_settings = [
  asyncHandler(async (req, res) => {
    if (!req.params.userId || req.session.user.id !== req.params.userId) {
      res.status(401).json("Not authenticated");
    }

    const userSettings = await prisma.UserSettings.findUnique({
      where: {
        userId: req.params.userId,
      },
    });
    res.status(200).json({ settings: userSettings });
  }),
];

exports.change_password = [
  body("userID").trim().escape(),
  body("currentPass", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),
  body("newPass", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),
  body("newPass2", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      if (req.body.newPass !== req.body.newPass2) {
        res.status(400).json("New passwords do not match");
      }

      const user = await prisma.User.findUnique({
        where: { id: req.body.userID },
      });

      const check = await bcrypt.compare(req.body.currentPass, user.password);

      if (check) {
        bcrypt.hash(req.body.newPass2, 10, async (err, hashedPass) => {
          if (err) {
            res.status(500).json(err);
          }

          await prisma.User.update({
            where: { id: req.body.userID },
            data: {
              password: hashedPass,
            },
          });

          res.status(200).json({});
        });
      } else if (!check) {
        res.status(401).json("Incorrect password");
      }
    }
  }),
];

exports.change_password_otp = [
  body("email", "Invalid Email").trim().isEmail().escape(),
  body("new_pass", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),
  body("new_pass2", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      if (req.body.new_pass !== req.body.new_pass2) {
        res.status(400).json("Passwords do not match");
      }

      const user = await prisma.User.findUnique({
        where: { email: req.body.email },
      });

      let currentDate = new Date();

      if (
        user.otpVerified === true &&
        user.otp &&
        user.otpExpiresAt > currentDate
      ) {
        bcrypt.hash(req.body.new_pass, 10, async (err, hashedPass) => {
          await prisma.User.update({
            where: { email: req.body.email },
            data: {
              password: hashedPass,
            },
          });
        });

        await prisma.User.update({
          where: { email: req.body.email },
          data: {
            otpVerified: false,
            otpExpiresAt: null,
            otp: null,
          },
        });

        res.status(200).json({});
      } else {
        res.status(400).json("Invalid or Expired OTP");
      }
    }
  }),
];
