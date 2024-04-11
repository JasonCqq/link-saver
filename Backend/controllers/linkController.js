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
  body("url", "Invalid URL").isURL().trim().isLength({ min: 1 }).escape(),
  body("folder").trim().escape(),
  body("bookmarked").trim().escape(),
  body("remind").trim().escape(),
  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    console.log("test0");
    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      console.log("test12");
      res.status(400).json(firstError);
    } else {
      console.log("test13");
      console.log(
        req.session,
        req.sessionID,
        req.session.user,
        req.session.user.id,
      );

      if (!req.params.userId || req.session.user.id !== req.params.userId) {
        res.status(401).json("Not authenticated");
      }

      console.log("test1");
      let date = req.body.remind;
      if (date === "") {
        date = null;
      }
      console.log("test2");
      let userUrl = decode(req.body.url, { level: "html5" });
      let decodedUrl = userUrl;

      if (!userUrl.startsWith("http://") && !userUrl.startsWith("https://")) {
        decodedUrl = "https://" + userUrl;
      }
      console.log("test3");
      // Scrape for title/screenshot
      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: minimal_args,
        });
        const page = await browser.newPage();

        console.log("test4");
        // Block Ads
        const blocked_domains = [
          "googlesyndication.com",
          "adservice.google.com",
        ];

        await page.setRequestInterception(true);

        console.log("test5");
        page.on("request", (request) => {
          const url = request.url();

          const isBlockedDomain = blocked_domains.some((domain) =>
            url.includes(domain),
          );

          isBlockedDomain ? request.abort() : request.continue();
        });
        console.log("test6");
        await page.goto(decodedUrl, { waitUntil: "domcontentloaded" });

        console.log("test7");
        const title = await page.title();
        const thumbnail = await page.screenshot({
          encoding: "base64",
          fullPage: false,
        });
        console.log("test9");
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
        console.log("test11");
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
    } else {
      if (!req.params.userId || req.session.user.id !== req.params.userId) {
        res.status(401).json("Not authenticated");
      }

      await prisma.Link.update({
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
    }

    res.status(200).json({});
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

//Puppeteer Settings
const minimal_args = [
  "--autoplay-policy=user-gesture-required",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AudioServiceOutOfProcess",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-notifications",
  "--disable-offer-store-unmasked-wallet-cards",
  "--disable-popup-blocking",
  "--disable-print-preview",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-setuid-sandbox",
  "--disable-speech-api",
  "--disable-sync",
  "--hide-scrollbars",
  "--ignore-gpu-blacklist",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-pings",
  "--no-sandbox",
  "--no-zygote",
  "--password-store=basic",
  "--use-gl=swiftshader",
  "--use-mock-keychain",
];
