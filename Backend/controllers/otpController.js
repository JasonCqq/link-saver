const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const prisma = require("../prisma/prismaClient");

require("dotenv").config();
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

exports.generateOTP = [
  body("email", "Invalid Email").trim().isEmail().escape(),

  asyncHandler(async (req, res, next) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    }
    // Empty Email
    else if (!req.body.email) {
      res.status(400).json("Email is required");
    } else {
      const email = await prisma.User.findUnique({
        where: {
          email: req.body.email,
        },
      });
      if (!email) {
        res.status(404).json("Email not found");
      } else {
        const tempCode = Math.floor(100000 + Math.random() * 900000);

        bcrypt.hash(String(tempCode), 10, async (err, hashedCode) => {
          if (err) {
            return;
          }

          await prisma.User.update({
            where: {
              email: req.body.email,
            },
            data: {
              otp: hashedCode,
              otpExpiresAt: new Date(new Date().getTime() + 15 * 60 * 1000), // 15 minutes
            },
          });
        });

        const info = await transporter.sendMail({
          to: `${req.body.email}`,
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

exports.verifyOTP = [
  body("email", "Invalid Email").trim().isEmail().escape(),
  body("otp", "Invalid OTP").trim().escape(),
  asyncHandler(async (req, res, next) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else if (!req.body.email || !req.body.otp) {
      res.status(400).json("Email and OTP code are required");
    } else {
      const user = await prisma.User.findUnique({
        where: {
          email: req.body.email,
        },
      });

      if (user) {
        let currentDate = new Date();
        const check = await bcrypt.compare(req.body.otp, user.otp);

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

exports.generateOTPLink = [
  body("username").trim().escape(),
  body("email", "Invalid Email").trim().isEmail().escape(),
  body("password", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    }
    // Empty Email
    else if (!req.body.email) {
      res.status(400).json("Email is required");
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

      const tempUserCheck = await prisma.tempUser.delete({
        where: {
          email: req.body.email,
        },
      });

      const tempCode = Math.floor(100000 + Math.random() * 900000);

      bcrypt.hash(String(tempCode), 10, async (err, hashedCode) => {
        if (err) {
          return;
        }
        const confirmationLink = `${req.protocol}://${req.get("host")}/user/create/${req.body.email}/${tempCode}`;

        await prisma.tempUser.create({
          data: {
            username: req.body.username,
            email: req.body.email,
            otp: hashedCode,
            password: req.body.password,
            otpExpiresAt: new Date(new Date().getTime() + 15 * 60 * 1000), // 15 minutes
          },
        });

        const info = await transporter.sendMail({
          to: `${req.body.email}`,
          from: "jason.cq.huang@gmail.com",
          subject: `Your Linkstorage Registration Confirmation Link`,
          text: `Linkstorage: Your OTP Link is: ${confirmationLink} , if you didn't request this, you can safely ignore it.`,
          html:
            "<h1 style='font-size: 1.25rem; color:black;'>Linkstorage</h1>" +
            "<p style='font-size: 1rem; color: black;'>Hi there!</p>" +
            "<p style='font-size: 1.1rem; color: black;'>We received a request for an OTP link for your Linkstorage account. Please use this One-Time Link below to complete your process:</p>" +
            `<a href=${confirmationLink} style='font-size: 1.5rem; font-weight:900;'>Click Here to Confirm your email</a>` +
            "<p style='font-size: 1rem; color: black;'>This One time link is valid for only 15 minutes. For your security, do not share this with anyone.</p>" +
            "<p style='font-size: 1rem; color: black;'>If you did not request this, please ignore this email or contact us if you have any concerns.</p>" +
            "<footer style='color:gray; font-size: 0.8rem;'>Thank you for using Linkstorage. Stay secure!</footer>",
        });

        res.status(200).json({});
      });
    }
  }),
];

exports.verifyOTPLink = [
  asyncHandler(async (req, res, next) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      const user = await prisma.tempUser.findUnique({
        where: {
          email: req.params.email,
        },
      });

      if (user) {
        let currentDate = new Date();
        const check = await bcrypt.compare(req.params.otp, user.otp);

        if (check && user.otpExpiresAt > currentDate) {
          await prisma.tempUser.update({
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

// exports.clearOTP
