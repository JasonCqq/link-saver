const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const prisma = require("../prisma/prismaClient");

// nodemailer settings
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "isaiah12@ethereal.email",
    pass: "mHZKtP6dfKUZKJw22M",
  },
});

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

        const user = await prisma.User.create({
          data: {
            username: req.body.username,
            email: req.body.email,
            password: hashedPass,
            folders: {
              create: {
                name: "default",
              },
            },
            userSettings: {
              create: {},
            },
          },
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

exports.delete_user = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }

  const user = await prisma.User.delete({
    where: {
      id: req.params.userId,
    },
  });
  req.session.user = null;
  req.session = null;

  res.status(200).json({});
});

exports.get_settings = [
  asyncHandler(async (req, res) => {
    if (!req.params.userId || req.session.user.id !== req.params.userId) {
      res.status(401).send("Not authenticated");
    }

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
      if (!req.params.userId || req.session.user.id !== req.params.userId) {
        res.status(401).send("Not authenticated");
      }

      const userSettings = await prisma.UserSettings.update({
        where: {
          userId: req.params.userId,
        },

        data: {
          previews: req.body.previews,
        },

        include: { user: true },
      });

      res.status(200).json({ user: userSettings.user, settings: userSettings });
    }
  }),
];

exports.change_password = [
  body("currentPass").trim().escape(),
  body("newPass", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),
  body("newPass2", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      res.status(400).json({ errors: errs.array().map((error) => error.msg) });
    } else {
      if (!req.params.userId || req.session.user.id !== req.params.userId) {
        res.status(401).send("Not authenticated");
      }

      if (req.body.newPass !== req.body.newPass2) {
        res.status(400).send("Passwords do not match");
      }

      try {
        const user = await prisma.User.findUnique({
          where: { id: req.params.userId },
        });

        bcrypt.compare(
          req.body.currentPass,
          user.password,
          async (err, res) => {
            if (res) {
              try {
                bcrypt.hash(req.body.newPass2, 10, async (err, hashedPass) => {
                  const updatedUser = await prisma.User.update({
                    where: { id: req.params.userId },
                    data: {
                      password: hashedPass,
                    },
                  });
                });
              } catch (err) {
                return res.status(500).json({
                  error: "Error Hashing Password. (Bcrypt Error)",
                });
              }
            }
            if (err) {
              console.log(err);
            }
          },
        );
      } catch (err) {
        console.log(err);
      }

      res.status(200).json({});
    }
  }),
];

exports.forgot_password = [
  body("forgot_email", "Invalid Email").trim().isEmail().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      res.status(400).json({ errors: errs.array().map((error) => error.msg) });
    } else {
      const tempCode = Math.floor(100000 + Math.random() * 900000);

      const otp = await prisma.OTP.create({
        data: {
          email: req.body.forgot_email,
          otp: tempCode,
          createdAt: new Date(), // This will be a DateTime object
          expiresAt: new Date(new Date().getTime() + 15 * 60 * 1000), // Adds 15 minutes
        },
      });

      const info = await transporter.sendMail({
        from: "LinkStorage <isaiah12@ethereal.email>",
        to: "isaiah12@ethereal.email",
        subject: "OTP Code",
        text: `Linkstorage: Your OTP Code is: ${tempCode} , if you didn't request this, you can safely ignore it."`,
        html:
          "<h1 style='font-size: 1rem; color:blue;'>Linkstorage</h1>" +
          `<p style='font-size: 1.5rem; color: black; font-weight:900;'>Your OTP Code is : ${tempCode} </p>` +
          "<p>This code will expire in 12 hours.</p>" +
          "<footer style='color:gray;'>If you didn't request this code, you can safely ignore it.</footer>",
      });

      console.log("Message sent: %s", info.messageId);
    }

    res.status(200).json({});
  }),
];

exports.check_otp = [
  body("forgot_email", "Invalid Email").trim().isEmail().escape(),
  body("forgot_otp", "Invalid OTP").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      res.status(400).json({ errors: errs.array().map((error) => error.msg) });
    } else {
      const email = await prisma.OTP.findUnique({
        where: {
          email: req.body.forgot_email,
        },
      });

      if (email) {
        if (email.otp === parseInt(req.body.forgot_otp)) {
          res.status(200).json({});
        } else if (email.otp !== parseInt(req.body.forgot_otp)) {
          console.log(email.otp, parseInt(req.body.forgot_otp));
          res.status(400).send("Invalid OTP Code");
        }
      }
    }
  }),
];

exports.change_password_otp = [
  body("forgot_email", "Invalid Email").trim().isEmail().escape(),
  body("forgot_new_pass", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),
  body("forgot_new_pass2", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      res.status(400).json({ errors: errs.array().map((error) => error.msg) });
    } else {
      console.log("test10");
      if (req.body.newPass !== req.body.newPass2) {
        res.status(400).send("Passwords do not match");
      }

      console.log("test11");

      bcrypt.hash(req.body.forgot_new_pass, 10, async (err, hashedPass) => {
        const updatedUser = await prisma.User.update({
          where: { email: req.body.forgot_email },
          data: {
            password: hashedPass,
          },
        });
      });
      console.log("test12");

      res.status(200).json({});
    }
  }),
];
