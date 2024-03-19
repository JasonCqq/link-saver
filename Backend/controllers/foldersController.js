const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/prismaClient");
const { body, validationResult } = require("express-validator");

exports.get_folder = asyncHandler(async (req, res) => {
  const folders = await prisma.Folder.findMany({
    where: {
      userId: req.params.userId,
    },
    include: {
      links: true,
    },
  });

  res.json({ folders: folders });
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

            user: {
              connect: { id: req.params.userId },
            },
          },
        });

        return res.json({ success: true });
      } catch (err) {
        console.log(err);
      }
    }
  }),
];

exports.edit_folder = [
  body("name").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      return res.json({ errors: errs.array().map((err) => err.msg) });
    } else {
      try {
        const folder = await prisma.Folder.update({
          where: {
            id: req.params.folderId,
            userId: req.params.userId,
          },

          data: {
            name: req.body.name,
          },
        });
      } catch (err) {
        console.log(err);
      }
    }

    return res.json({ success: true });
  }),
];

exports.delete_folder = asyncHandler(async (req, res) => {
  try {
    const folder = await prisma.Folder.delete({
      where: {
        id: req.params.folderId,
        userId: req.params.userId,
      },
    });
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
  }
});
