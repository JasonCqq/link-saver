const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/prismaClient");
const { body, validationResult } = require("express-validator");

require("dotenv").config();

exports.get_urls = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).json("Not authenticated");
  }

  try {
    const urls = await prisma.URL.findMany({
      where: {
        userId: req.params.userId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ urls: urls });
  } catch (err) {
    console.error(err);
  }
});

exports.create_urls = [
  body("userID").trim().escape(),
  body("urls").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      try {
        await prisma.URL.create({
          data: {
            url: req.body.urls,
            title: "None currently",

            user: {
              connect: {
                id: req.body.userID,
              },
            },
          },
        });
        res.status(200).json({});
      } catch (err) {
        console.log(err);
      }
    }
  }),
];

exports.delete_urls = asyncHandler(async (req, res) => {});

exports.deleteAll_urls = asyncHandler(async (req, res) => {});

exports.update_url = asyncHandler(async (req, res) => {});
