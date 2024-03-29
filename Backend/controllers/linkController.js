const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const prisma = require("../prisma/prismaClient");
const { decode } = require("html-entities");
const puppeteer = require("puppeteer");

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
  body("url").trim().isLength({ min: 1 }).escape(),
  body("folder").trim().escape(),
  body("bookmarked").trim().escape(),
  body("remind").trim().escape(),
  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      res.status(400).json({ errors: errs.array().map((err) => err.msg) });
    } else {
      try {
        if (!req.params.userId || req.session.user.id !== req.params.userId) {
          res.status(401).send("Not authenticated");
        }

        let date = req.body.remind;
        if (date === "") {
          date = null;
        }

        let userUrl = decode(req.body.url, { level: "html5" });
        let decodedUrl = userUrl;

        if (!userUrl.startsWith("http://") && !userUrl.startsWith("https://")) {
          decodedUrl = "https://" + userUrl;
        }

        // Scrape for title/screenshot
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto(decodedUrl, { waitUntil: "domcontentloaded" });

        const title = await page.title();
        const thumbnail = await page.screenshot({ encoding: "base64" });

        await browser.close();

        const link = await prisma.Link.create({
          data: {
            url: decodedUrl,
            user: {
              connect: {
                id: req.params.userId,
              },
            },

            ...(req.body.folder
              ? { folder: { connect: { id: req.body.folder } } }
              : {}),

            title: title,
            bookmarked: JSON.parse(req.body.bookmarked),
            remind: date,
            thumbnail: thumbnail,
          },
        });

        res.status(200).json({});
      } catch (err) {
        console.log(err);
      }
    }
  }),
];

exports.delete_link = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }
  const link = await prisma.Link.update({
    where: {
      id: req.params.id,
      userId: req.params.userId,
    },

    data: {
      trash: true,
    },
  });

  res.status(200).json({});
});

exports.perma_delete_link = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }
  const link = await prisma.Link.delete({
    where: {
      id: req.params.id,
      trash: true,
      userId: req.params.userId,
    },
  });

  res.status(200).json({});
});

exports.perma_delete_all = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }

  const links = await prisma.Link.deleteMany({
    where: {
      trash: true,
      userId: req.params.userId,
    },
  });

  res.status(200).json({});
});

exports.restore_link = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }

  const link = await prisma.Link.update({
    where: {
      id: req.params.id,
      userId: req.params.userId,
    },

    data: {
      trash: false,
    },
  });

  res.status(200).json({ success: true });
});

exports.edit_link = [
  // Missing escape()
  body("title").trim(),
  body("folder").trim().escape(),
  body("bookmarked").trim().escape(),
  body("remind").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      res.status(400).json({ errors: errs.array().map((err) => err.msg) });
    } else {
      try {
        if (!req.params.userId || req.session.user.id !== req.params.userId) {
          res.status(401).send("Not authenticated");
        }

        await prisma.$transaction(async (prisma) => {
          const link = await prisma.Link.update({
            where: {
              id: req.params.id,
              userId: req.params.userId,
            },

            data: {
              title: req.body.title,
              bookmarked: JSON.parse(req.body.bookmarked),
              ...(req.body.folder
                ? { folder: { connect: { id: req.body.folder } } }
                : {}),
              remind: req.body.remind || null,
            },
          });
        });
      } catch (err) {
        console.log(err);
      }
    }

    res.status(200).json({});
  }),
];

exports.get_links = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }

  const links = await prisma.Link.findMany({
    where: {
      trash: false,
      userId: req.params.userId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedLinks = formatLinks(links);

  res.status(200).json({ links: formattedLinks });
});

exports.get_bookmarks = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }

  const links = await prisma.Link.findMany({
    where: {
      bookmarked: true,
      trash: false,
      userId: req.params.userId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedLinks = formatLinks(links);

  res.status(200).json({ links: formattedLinks });
});

exports.get_upcoming = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }

  const links = await prisma.Link.findMany({
    where: {
      userId: req.params.userId,
      trash: false,
      remind: {
        not: {
          equals: null,
        },
      },
    },

    orderBy: {
      remind: "desc",
    },
  });

  const formattedLinks = formatLinks(links);

  res.status(200).json({ links: formattedLinks });
});

exports.get_trash = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }

  const links = await prisma.Link.findMany({
    where: {
      userId: req.params.userId,
      trash: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedLinks = formatLinks(links);

  res.status(200).json({ links: formattedLinks });
});

exports.search_link = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }

  const property = req.query.t;
  const query = req.query.q;
  let condition = {};

  if (property === "Dashboard") {
    condition = { trash: false };
  } else if (property === "Bookmarks") {
    condition = { bookmarked: true, trash: false };
  } else if (property === "Upcoming") {
    condition = {
      remind: {
        not: null,
      },

      trash: false,
    };
  } else if (property === "Trash") {
    condition = { trash: true };
  }

  const links = await prisma.Link.findMany({
    where: {
      userId: req.params.userId,
      AND: [
        condition,
        {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              url: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
      ],
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedLinks = formatLinks(links);

  res.status(200).json({ links: formattedLinks });
});
