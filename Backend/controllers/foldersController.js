const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/prismaClient");
const { body, validationResult } = require("express-validator");

exports.get_folder = asyncHandler(async (req, res) => {
  const folders = await prisma.Folder.findMany({
    include: {
      links: true,
    },
  });
  console.log(folders);

  res.json({ folders: folders });

  // console.log(req.session.user);
  // if (req.session.user.id === req.params.userId) {
  //   console.log(req.session.user);

  //   const folders = await prisma.Folder.findMany({
  //     where: {
  //       userId: `${req.params.userId}`,
  //     },
  //   });

  //   return res.json({ folders: folders });
  // } else {
  //   return res.json({ error: "Forbidden" });
  // }
});

exports.create_folder = [
  body("name").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      return res.json({ errors: errs.array().map((err) => err.msg) });
    } else {
      try {
        const folder = await prisma.Folder.create({
          data: {
            name: req.body.name,
          },
        });

        return res.json({ success: true });
      } catch (err) {
        console.log(err);
      }
    }
  }),
];
