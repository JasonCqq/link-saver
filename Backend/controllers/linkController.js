const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const prisma = require("../prisma/prismaClient");

exports.create_link = [
  body("title").trim().escape(),
  body("url").trim().escape(),
  body("thumbnail").trim().escape(),
  body("folder").trim().escape(),
  body("bookmarked").trim().escape(),
  body("remind").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      return res.json({ errors: errs.array().map((err) => err.msg) });
    } else {
      try {
        const date = new Date();

        const link = await prisma.Link.create({
          data: {
            url: req.body.url,
            title: req.body.title,
            bookmarked: false,
            thumbnail: req.body.thumbnail,
            remind: date,
          },
        });
        return res.json({ success: true });
      } catch (err) {
        console.log(err);
      }
    }
  }),
];
