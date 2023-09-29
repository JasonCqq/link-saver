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
        // let isBookmarked;
        // req.body.bookmarked === "true"
        //   ? (isBookmarked = true)
        //   : (isBookmarked = false);

        const link = await prisma.Link.create({
          data: {
            url: req.body.url,
            title: req.body.title,
            bookmarked: JSON.parse(req.body.bookmarked),
            thumbnail: req.body.thumbnail,
          },
        });
        return res.json({ success: true });
      } catch (err) {
        console.log(err);
      }
    }
  }),
];

exports.get_links = asyncHandler(async (req, res) => {
  const links = await prisma.Link.findMany();

  console.log(links);

  res.json({ links: links });
});
