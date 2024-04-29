const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const prisma = require("../prisma/prismaClient");

// nodemailer settings
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: `${process.env.SENDGRID_API_KEY}`,
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
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      const emailExists = await prisma.User.findUnique({
        where: { email: req.body.email },
      });

      if (emailExists) {
        return res.status(400).json("Email already exists");
      }

      const usernameExists = await prisma.User.findUnique({
        where: { username: req.body.username },
      });

      if (usernameExists) {
        return res.status(400).json("User already exists");
      }

      // Hash Password
      bcrypt.hash(req.body.password, 10, async (err, hashedPass) => {
        if (err) {
          res.status(500).json({
            errors: "Error Hashing Password. (Bcrypt Error)",
            oldData: {
              username: req.body.username,
              email: req.body.email,
              password: req.body.password,
            },
          });
        }

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

        const userData = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          creationDate: newUser.creationDate,
        };

        req.session.user = userData;
        res.status(200).json({ user: userData, settings: newUserSettings });
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

exports.delete_user = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).json("Not authenticated");
  } else {
    await prisma.User.delete({
      where: {
        id: req.params.userId,
      },
    });

    req.session.destroy((err) => {
      if (err) {
        res.status(500).json("Internal Server Error");
      }
    });
    res.status(200).json({});
  }
});

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

exports.submit_settings = [
  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      if (!req.params.userId || req.session.user.id !== req.params.userId) {
        res.status(401).json("Not authenticated");
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
      if (!req.params.userId || req.session.user.id !== req.params.userId) {
        res.status(401).json("Not authenticated");
      }

      if (req.body.newPass !== req.body.newPass2) {
        res.status(400).json("New passwords do not match");
      }

      const user = await prisma.User.findUnique({
        where: { id: req.params.userId },
      });

      const check = await bcrypt.compare(req.body.currentPass, user.password);

      if (check) {
        bcrypt.hash(req.body.newPass2, 10, async (err, hashedPass) => {
          if (err) {
            res.status(500).json(err);
          }

          await prisma.User.update({
            where: { id: req.params.userId },
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

// Forgot Password 3 Step Process
exports.forgot_password = [
  body("forgot_email", "Invalid Email").trim().isEmail().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      const user = await prisma.User.findUnique({
        where: {
          email: req.body.forgot_email,
        },
      });

      if (!user) {
        res.status(404).json("User not found");
      } else {
        const tempCode = Math.floor(100000 + Math.random() * 900000);

        bcrypt.hash(String(tempCode), 10, async (err, hashedCode) => {
          if (err) {
            return;
          }

          await prisma.User.update({
            where: {
              email: req.body.forgot_email,
            },
            data: {
              otp: hashedCode,
              otpExpiresAt: new Date(new Date().getTime() + 15 * 60 * 1000), // 15 minutes
            },
          });
        });

        const info = await transporter.sendMail({
          to: `${req.body.forgot_email}`,
          from: "jason.cq.huang@gmail.com",
          subject: `${tempCode} is your Linkstorage OTP Code`,
          text: `Linkstorage: Your OTP Code is: ${tempCode} , if you didn't request this, you can safely ignore it.`,
          html:
            "<h1 style='font-size: 1.25rem; color:black;'>Linkstorage</h1>" +
            "<p style='font-size: 1rem; color: black;'>Hi there!</p>" +
            "<p style='font-size: 1.1rem; color: black;'>We received a request for an OTP code for your Linkstorage account. Please use this One-Time Password (OTP) below to complete your process:</p>" +
            `<p style='font-size: 1.5rem; color: black; font-weight:900;'>Your OTP Code is: ${tempCode}</p>` +
            "<p style='font-size: 1rem; color: black;'>This OTP code is valid for only 15 minutes. For your security, do not share this code with anyone.</p>" +
            "<p style='font-size: 1rem; color: black;'>If you did not request this code, please ignore this email or contact us if you have any concerns.</p>" +
            "<footer style='color:gray; font-size: 0.8rem;'>Thank you for using Linkstorage. Stay secure!</footer>",
        });

        res.status(200).json({});
      }
    }
  }),
];

exports.check_otp = [
  body("forgot_email", "Invalid Email").trim().isEmail().escape(),
  body("forgot_otp", "Invalid OTP").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      const user = await prisma.User.findUnique({
        where: {
          email: req.body.forgot_email,
        },
      });

      if (user) {
        let currentDate = new Date();
        const check = await bcrypt.compare(req.body.forgot_otp, user.otp);

        if (check && user.otpExpiresAt > currentDate) {
          await prisma.User.update({
            where: {
              id: user.id,
            },
            data: {
              otpVerified: true,
            },
          });

          res.status(200).json({});
        } else if (!check || user.otpExpiresAt < currentDate) {
          res.status(401).json("Invalid OTP");
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

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      if (req.body.forgot_new_pass !== req.body.forgot_new_pass2) {
        res.status(400).json("Passwords do not match");
      }

      const user = await prisma.User.findUnique({
        where: { email: req.body.forgot_email },
      });

      let currentDate = new Date();

      if (
        user.otpVerified === true &&
        user.otp &&
        user.otpExpiresAt > currentDate
      ) {
        bcrypt.hash(req.body.forgot_new_pass, 10, async (err, hashedPass) => {
          await prisma.User.update({
            where: { email: req.body.forgot_email },
            data: {
              password: hashedPass,
            },
          });
        });

        await prisma.User.update({
          where: { email: req.body.forgot_email },
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
