const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const ogs = require("open-graph-scraper");
const prisma = require("../prisma/prismaClient");
const { decode } = require("html-entities");

function formatLinks(links) {
  links.map((link) => {
    link.url = link.url.replace("www.", "");
    link.url = link.url.replace(/^(https?:\/\/)/, "");
    link.createdAt = link.createdAt.toLocaleDateString("en-US");
    return link;
  });

  return links;
}

exports.create_link = [
  body("url").trim().escape(),
  body("folder").trim().escape(),
  body("bookmarked").trim().escape(),
  body("remind").trim().escape(),
  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      return res.json({ errors: errs.array().map((err) => err.msg) });
    } else {
      try {
        // Convert date to null if no date provided
        let date = req.body.remind;
        if (date === "") {
          date = null;
        }

        // Adding Rich Previews
        let decodedUrl = decode(req.body.url, { level: "html5" });
        let tempTitle;
        let tempThumbnail;

        const options = { url: decodedUrl };
        ogs(options)
          .then(async (data) => {
            const { error, result } = data;
            tempTitle = result?.ogTitle || "A simple website";
            tempThumbnail = result?.ogImage?.[0]?.url || "";

            await prisma.$transaction(async (prisma) => {
              // Check for folder, create "default" folder if none
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

              // Create new link and connect folder
              const link = await prisma.Link.create({
                data: {
                  url: decodedUrl,
                  folder: {
                    connect: {
                      id: folderId,
                    },
                  },
                  title: tempTitle,
                  bookmarked: JSON.parse(req.body.bookmarked),
                  remind: date,
                  thumbnail: tempThumbnail,
                },
              });

              const newLinkId = link.id;

              // Add link to folder.
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
          })
          .catch((err) => {
            console.error(err);
          });
      } catch (err) {
        console.log(err);
      }
    }
  }),
];

exports.delete_link = [
  body("id").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      return res.json({ errors: errs.array().map((err) => err.msg) });
    } else {
      const link = await prisma.Link.update({
        where: {
          id: req.body.id,
        },

        data: {
          trash: true,
        },
      });

      return res.json({ success: true });
    }
  }),
];

exports.perma_delete_link = asyncHandler(async (req, res) => {
  const link = await prisma.Link.delete({
    where: {
      id: req.params.id,
      trash: true,
    },
  });

  return res.json({ success: true });
});

exports.get_links = asyncHandler(async (req, res) => {
  const links = await prisma.Link.findMany({
    where: {
      trash: false,
    },
  });

  const formattedLinks = formatLinks(links);

  res.json({ links: formattedLinks });
});

exports.get_bookmarks = asyncHandler(async (req, res) => {
  const links = await prisma.Link.findMany({
    where: {
      bookmarked: true,
      trash: false,
    },
  });

  const formattedLinks = formatLinks(links);

  res.json({ links: formattedLinks });
});

exports.get_upcoming = asyncHandler(async (req, res) => {
  const links = await prisma.Link.findMany({
    where: {
      trash: false,
      remind: {
        not: {
          equals: null,
        },
      },
    },
  });

  const formattedLinks = formatLinks(links);

  res.json({ links: formattedLinks });
});

exports.get_trash = asyncHandler(async (req, res) => {
  const links = await prisma.Link.findMany({
    where: {
      trash: true,
    },
  });

  const formattedLinks = formatLinks(links);

  res.json({ links: formattedLinks });
});
