const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const prisma = require("../prisma/prismaClient");
const { decode } = require("html-entities");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

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
  body("url", "Invalid URL").isURL().trim().isLength({ min: 1 }).escape(),
  body("folder").trim().escape(),
  body("bookmarked").trim().escape(),
  body("remind").trim().escape(),
  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      if (!req.params.userId || req.session.user.id !== req.params.userId) {
        res.status(401).json("Not authenticated");
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
      try {
        puppeteer.use(StealthPlugin());

        const browser = await puppeteer.launch({
          headless: true,
          args: [
            "--proxy-server='direct://'",
            "--proxy-bypass-list=*",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-setuid-sandbox",
            "--no-first-run",
            "--no-sandbox",
            "--no-zygote",
            "--no-sandbox",
            "--disable-infobars",
            "--window-position=0,0",
            "--ignore-certifcate-errors",
            "--ignore-certifcate-errors-spki-list",
          ],
        });
        const page = await browser.newPage();
        await page.setViewport({
          width: 640,
          height: 480,
          deviceScaleFactor: 1.25,
        });

        // Block Ad Domains
        const blocked_domains = [
          "googlesyndication.com",
          "adservice.google.com",
          "https://pagead2.googlesyndication.com",
          "https://creativecdn.com",
          "https://www.googletagmanager.com",
          "https://cdn.krxd.net",
          "https://cdn.concert.io",
          "https://z.moatads.com",
          "https://cdn.permutive.com",
        ];
        await page.setRequestInterception(true);

        page.on("request", (request) => {
          const url = request.url();

          const isBlockedDomain = blocked_domains.some((domain) =>
            url.startsWith(domain),
          );

          isBlockedDomain ? request.abort() : request.continue();
        });

        // await page.goto(decodedUrl, { waitUntil: "domcontentloaded" });
        await page.goto(decodedUrl, { waitUntil: "networkidle2" });
        await page.waitForSelector("div");

        const data = await page.evaluate(() => {
          const title = document.head.querySelector(
            'meta[property="og:title"]',
          )?.content;
          const thumbnail = document.querySelector(
            'meta[property="og:image"]',
          )?.content;

          return { title, thumbnail };
        });

        let thumbnail;

        if (data.thumbnail) {
          const imagePage = await browser.newPage();
          const response = await imagePage.goto(data.thumbnail, {
            waitUntil: "networkidle0",
          });
          const buffer = await response.buffer();
          thumbnail = buffer;
          await imagePage.close();
        } else {
          thumbnail = await page.screenshot({
            fullPage: false,
            quality: 15,
            type: "webp",
            omitBackground: true,
          });
        }

        let title;
        if (data.title) {
          title = data.title;
        } else {
          title = await page.title();
        }

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
    res.status(401).json("Not authenticated");
  }
  await prisma.Link.update({
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
    res.status(401).json("Not authenticated");
  }
  await prisma.Link.delete({
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
    res.status(401).json("Not authenticated");
  }

  await prisma.Link.deleteMany({
    where: {
      trash: true,
      userId: req.params.userId,
    },
  });

  res.status(200).json({});
});

exports.restore_link = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).json("Not authenticated");
  }

  await prisma.Link.update({
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
  body("title").trim(),
  body("folder").trim().escape(),
  body("bookmarked").trim().escape(),
  body("remind").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    }
    if (!req.params.userId || req.session.user.id !== req.params.userId) {
      res.status(401).json("Not authenticated");
    } else {
      try {
        await prisma.Link.update({
          where: {
            id: req.params.id,
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
        res.status(200).json({});
      } catch (err) {
        console.log(err);
      }
    }
  }),
];

exports.get_links = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).json("Not authenticated");
  }

  const links = await prisma.Link.findMany({
    where: {
      userId: req.params.userId,
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
    res.status(401).json("Not authenticated");
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

exports.mass_edit_links = [
  body("massTitle").trim(),
  body("massRemind").trim().escape(),
  body("massFolder").trim().escape(),
  body("massBookmark").trim().escape(),
  body("massIDs").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!req.params.userId || req.session.user.id !== req.params.userId) {
      res.status(401).json("Not authenticated");
    }

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      let tempBook;
      req.body.massBookmark ? (tempBook = true) : (tempBook = undefined);

      await prisma.$transaction(async (prisma) => {
        for (const id of req.body.massIDs) {
          await prisma.Link.update({
            where: {
              id: id,
              userId: req.params.userId,
            },

            data: {
              title: req.body.massTitle || undefined,
              remind: req.body.massRemind || undefined,
              ...(req.body.massFolder
                ? { folder: { connect: { id: req.body.massFolder } } }
                : {}),
              bookmarked: tempBook,
            },
          });
        }
      });

      res.status(200).json({});
    }
  }),
];

exports.mass_restore_delete_links = [
  body("massDelete").trim().escape(),
  body("massRestore").trim().escape(),
  body("massIDs").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!req.params.userId || req.session.user.id !== req.params.userId) {
      res.status(401).json("Not authenticated");
    }

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      let resOrDel;

      if (
        JSON.parse(req.body.massRestore) === true &&
        JSON.parse(req.body.massDelete) === false
      ) {
        resOrDel = false;
      } else if (
        JSON.parse(req.body.massRestore) === false &&
        JSON.parse(req.body.massDelete) === true
      ) {
        resOrDel = true;
      }

      await prisma.$transaction(async (prisma) => {
        for (const id of req.body.massIDs) {
          await prisma.Link.update({
            where: {
              id: id,
              userId: req.params.userId,
            },

            data: {
              trash: resOrDel,
            },
          });
        }
      });

      res.status(200).json({});
    }
  }),
];
