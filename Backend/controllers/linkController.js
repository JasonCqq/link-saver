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
        let date = req.body.remind;
        if (date === "") {
          date = null;
        }

        await prisma.$transaction(async (prisma) => {
          const existingFolder = await prisma.Folder.findUnique({
            where: {
              id: req.body.folder,
            },
          });
          let folderId;
          if (existingFolder) {
            folderId = existingFolder.id;
          } else {
            const newFolder = await prisma.Folder.create({
              data: {
                name: "d",
              },
            });
            folderId = newFolder.id;
          }

          const link = await prisma.Link.create({
            data: {
              url: req.body.url,
              folder: {
                connect: {
                  id: folderId,
                },
              },
              title: req.body.title,
              bookmarked: JSON.parse(req.body.bookmarked),
              remind: date,
              thumbnail: req.body.thumbnail,
            },
          });

          const newLinkId = link.id;

          prisma.Folder.update({
            where: {
              id: folderId,
            },
            data: {
              links: {
                connect: { id: newLinkId },
              },
            },
          });
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

  res.json({ links: links });
});

exports.get_bookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await prisma.Link.findMany({
    where: {
      bookmarked: true,
    },
  });

  res.json({ links: bookmarks });
});

exports.get_upcoming = asyncHandler(async (req, res) => {
  const upcoming = await prisma.Link.findMany({
    where: {
      remind: {
        not: {
          equals: null,
        },
      },
    },
  });

  res.json({ links: upcoming });
});

exports.get_trash = asyncHandler(async (req, res) => {
  const trash = await prisma.Link.findMany({
    where: {
      trash: true,
    },
  });

  res.json({ links: trash });
});
