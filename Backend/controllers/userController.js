const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const prisma = require("../prisma/prismaClient");

require("dotenv").config();

// Verify Google Token
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience:
      "307651115210-ro83kbna8k95pfm0ft2dubaoc2i3fpbc.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  return payload["email"];
}

// Supabase
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.create_user = [
  body("username").trim().escape(),
  body("password", "Password must be between 8-20 characters")
    .trim()
    .isLength({ min: 8, max: 20 })
    .escape(),
  body("email", "Invalid Email").trim().isEmail().escape(),
  body("isExternal").trim().escape(),

  asyncHandler(async (req, res) => {
    let isExternal = req.body.isExternal === "true";
    const errs = validationResult(req);

    if (!errs.isEmpty() && isExternal === false) {
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
        let user;

        if (isExternal === true) {
          user = await verifyToken(req.body.password);
        }

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
                password: user ? "" : hashedPass,
                folders: {
                  create: {
                    name: "Default",
                  },
                },
                external_account: user ? true : false,
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
              external_account: newUser.external_account,
            };

            // Establish the session using Passport's req.login
            req.login(newUser, (err) => {
              if (err) {
                console.log(err);
                res.status(500).json({ errors: "Session creation failed" });
              }

              return res
                .status(200)
                .json({ user: userData, settings: newUserSettings });
            });
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
  body("isExternal").trim().escape(),

  async (req, res, next) => {
    let isExternal = req.body.isExternal === "true";
    const errs = validationResult(req);

    if (!errs.isEmpty() && isExternal === false) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      // Google sign in
      if (isExternal === true) {
        let googleUser = await verifyToken(req.body.username);

        const user = await prisma.User.findUnique({
          where: {
            email: googleUser,
            external_account: true,
          },
          include: {
            userSettings: true,
          },
        });

        if (user) {
          const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            creationDate: user.creationDate,
            external_account: user.external_account,
          };

          req.login(user, (err) => {
            if (err) return next(err);

            // req.session.user = userData;
            return res
              .status(200)
              .json({ user: userData, settings: user.userSettings });
          });
        } else {
          res
            .status(400)
            .json(
              "No Google account found, please use regular login or create a google account"
            );
        }
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

            req.login(user, (err) => {
              if (err) return next(err);

              return res
                .status(200)
                .json({ user: userData, settings: user.userSettings });
            });
          }
        })(req, res, next);
      }
    }
  },
];

exports.logout_user = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      res.clearCookie("connect.sid"); // Clear session cookie
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});
exports.delete_user = [
  body("userID").trim().escape(),

  asyncHandler(async (req, res) => {
    const check = req.user;

    if (!check) {
      res.status(401).json("Not authenticated");
    } else {
      const folderPath = `thumbnails/${req.user.id}`;

      // 1. List all files inside the nested user folder
      const { data: files, error: listError } = await supabase.storage
        .from("thumbnails")
        .list(folderPath); // Passes "thumbnails/userId" as the prefix

      if (listError) {
        throw listError;
      }

      if (files && files.length > 0) {
        // 2. Map files to their full paths including the nested structure
        const filePaths = files.map(
          (file) => `thumbnails/${req.user.id}/${file.name}`
        );

        // 3. Delete the files using an array of full paths
        const { error: deleteError } = await supabase.storage
          .from("thumbnails")
          .remove(filePaths);

        if (deleteError) {
          throw deleteError;
        }
      }

      await prisma.User.delete({
        where: {
          id: req.user.id,
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
    if (!req.params.userId || req.user.id !== req.params.userId) {
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
        where: { id: req.user.id },
      });

      const check = await bcrypt.compare(req.body.currentPass, user.password);

      if (check) {
        bcrypt.hash(req.body.newPass2, 10, async (err, hashedPass) => {
          if (err) {
            res.status(500).json(err);
          }

          await prisma.User.update({
            where: { id: req.user.id },
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
