const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const prisma = require("../prisma/prismaClient");
const { decode } = require("html-entities");

const { getBrowser } = require("../routes/utils/browser.js");

const sharp = require("sharp");
const fetch = require("node-fetch-commonjs");

// Supabase
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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
  body("userID").trim().escape(),
  body("url", "Invalid URL").isURL().trim().isLength({ min: 1 }).escape(),
  body("folder").trim().escape(),
  body("bookmarked").trim().escape(),
  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      // Decodes URL after URL gets trim/escape in body.
      let decodedUrl = decode(req.body.url, { level: "html5" });

      if (
        !decodedUrl.startsWith("http://") &&
        !decodedUrl.startsWith("https://")
      ) {
        decodedUrl = "https://" + decodedUrl;
      }

      // Scrape for title/screenshot
      let thumbnail;
      let title = "";
      try {
        console.time("fetch");
        const browser = await getBrowser();
        const page = await browser.newPage();

        await page.goto(decodedUrl, {
          waitUntil: "domcontentloaded",
        });

        // Scrape metadata
        const metadata = await page.evaluate(() => {
          const getMetaContent = (property) => {
            let meta = document.querySelector(`meta[property="${property}"]`);
            if (meta) return meta.getAttribute("content");

            meta = document.querySelector(`meta[name="${property}"]`);
            if (meta) return meta.getAttribute("content");

            return null;
          };

          return {
            ogTitle: getMetaContent("og:title"),
            ogImage: getMetaContent("og:image"),
            ogType: getMetaContent("og:type"),
            twitterTitle: getMetaContent("twitter:title"),
            twitterImage: getMetaContent("twitter:image"),
            title: document.title,
          };
        });

        console.timeEnd("fetch");

        // Get title
        title =
          metadata.ogTitle ??
          metadata.twitterTitle ??
          metadata.title ??
          "Untitled Webpage";
        thumbnail = metadata.ogImage ?? metadata.twitterImage;

        // Get image or screenshot
        let imageBuffer;
        if (thumbnail === null) {
          console.log("No OG image found, looking for relevant image in page");

          console.time("selector");
          await page.waitForLoadState("networkidle", { timeout: 3000 });

          // Try to find a relevant image in the page
          const pageImage = await page.evaluate(() => {
            const imgs = [...document.images].filter(
              (img) =>
                img.src &&
                !img.src.startsWith("data:") &&
                img.width >= 100 &&
                img.height >= 100
            );
            return imgs[0]?.src || null;
          });

          if (pageImage) {
            console.log("Found relevant image:", pageImage);
            try {
              const imageResponse = await fetch(pageImage);
              if (imageResponse.ok) {
                imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
              } else {
                throw new Error("Image fetch failed");
              }
            } catch (err) {
              console.log("Image fetch failed, taking screenshot");
              await page.waitForLoadState("load");
              imageBuffer = await page.screenshot({ type: "png" });
            }
          } else {
            console.log("No suitable image found, taking screenshot");
            await page.waitForLoadState("load");
            imageBuffer = await page.screenshot({ type: "png" });
          }
          console.timeEnd("selector");

          console.time("sharp#1");
          try {
            thumbnail = await sharp(Buffer.from(imageBuffer))
              .webp({ quality: 75 })
              .toBuffer();
          } catch (err) {
            thumbnail = "";
            console.error(err);
          }
          console.timeEnd("sharp#1");

          // OG:Image found
        } else if (thumbnail !== null) {
          console.time("image fetch");
          try {
            const imageResponse = await fetch(thumbnail);
            if (!imageResponse.ok) throw new Error("Fetch failed");
            imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          } catch (err) {
            console.log("Thumbnail fetch failed, taking screenshot instead");
            await page.waitForLoadState("load");
            imageBuffer = await page.screenshot({ type: "png" });
          }

          console.timeEnd("image fetch");

          console.time("sharp#2");
          try {
            thumbnail = await sharp(Buffer.from(imageBuffer))
              .webp({ quality: 75 })
              .toBuffer();
          } catch (err) {
            thumbnail = "";
            console.error(err);
          }
          console.timeEnd("sharp#2");
        }

        await page.close();
        console.log(metadata);

        // Create link in database
        console.time("database operation");
        const link = await prisma.Link.create({
          data: {
            url: decodedUrl,
            user: {
              connect: {
                id: req.body.userID,
              },
            },
            ...(req.body.folder
              ? { folder: { connect: { id: req.body.folder } } }
              : {}),
            title: title,
            bookmarked: JSON.parse(req.body.bookmarked),
            thumbnail: "",
            visits: 0,
          },
        });
        console.timeEnd("database operation");

        if (thumbnail === "") {
          res.status(200).json({ link: link });
        } else if (thumbnail) {
          console.time("supabase");
          const linkID = link.id;

          let imagePath = `thumbnails/${req.body.userID}/${linkID}`;
          let publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/thumbnails/${imagePath}`;

          const updatedLink = await prisma.Link.update({
            where: {
              id: linkID,
            },
            data: {
              thumbnail: imagePath,
              pURL: publicUrl,
            },
          });

          res.status(202).json({ link: updatedLink });

          (async () => {
            const { error } = await supabase.storage
              .from("thumbnails")
              .upload(imagePath, thumbnail, {
                contentType: "image/webp",
              });

            console.timeEnd("supabase");
            req.app.get("io").emit("thumbnail-ready", updatedLink);
            if (error) {
              console.error("Supabase Error: ", error);
            }
          })();
        }
      } catch (error) {
        console.error("Error fetching or processing:", error);

        // Fallback to default link
        const link = await prisma.Link.create({
          data: {
            url: decodedUrl,
            user: {
              connect: {
                id: req.body.userID,
              },
            },
            ...(req.body.folder
              ? { folder: { connect: { id: req.body.folder } } }
              : {}),
            title: decodedUrl,
            bookmarked: JSON.parse(req.body.bookmarked),
            thumbnail: "",
          },
        });
        res.status(200).json({ link: link });
      }
    }
  }),
];

exports.delete_link = [
  body("id").trim().escape(),
  body("userID").trim().escape(),

  asyncHandler(async (req, res) => {
    await prisma.Link.update({
      where: {
        id: req.body.id,
        userId: req.body.userID,
      },

      data: {
        trash: true,
      },
    });

    res.status(200).json({});
  }),
];

exports.perma_delete_link = [
  body("userID").trim().escape(),

  asyncHandler(async (req, res) => {
    await prisma.Link.delete({
      where: {
        id: req.body.id,
        trash: true,
        userId: req.body.userID,
      },
    });

    res.status(200).json({});
  }),
];

exports.perma_delete_all = [
  body("userID").trim().escape(),

  asyncHandler(async (req, res) => {
    await prisma.Link.deleteMany({
      where: {
        trash: true,
        userId: req.body.userID,
      },
    });

    res.status(200).json({});
  }),
];

exports.restore_link = [
  body("id").trim().escape(),
  body("userID").trim().escape(),

  asyncHandler(async (req, res) => {
    await prisma.Link.update({
      where: {
        id: req.body.id,
        userId: req.body.userID,
      },

      data: {
        trash: false,
      },
    });

    res.status(200).json();
  }),
];

exports.edit_link = [
  body("id").trim().escape(),
  body("userID").trim().escape(),
  body("title").trim(),
  body("folder").trim().escape(),
  body("bookmarked").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    }

    try {
      const link = await prisma.Link.update({
        where: {
          id: req.body.id,
          userId: req.body.userID,
        },

        data: {
          title: req.body.title,
          bookmarked: JSON.parse(req.body.bookmarked),
          ...(req.body.folder
            ? { folder: { connect: { id: req.body.folder } } }
            : {}),
        },
      });
      res.status(200).send({ link });
    } catch (err) {
      console.log(err);
    }
  }),
];

exports.get_links = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).json("Not authenticated");
  }

  try {
    const links = await prisma.Link.findMany({
      where: {
        userId: req.params.userId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const updatedLinks = await Promise.all(
      links.map(async (link) => {
        const bucketName = "thumbnails";
        const { data: publicURL, error } = await supabase.storage
          .from(bucketName)
          .getPublicUrl(link.thumbnail);

        if (error) {
          console.error("Error retrieving public URL:", error.message);
          return { ...link, thumbnail: null };
        }

        return { ...link, thumbnail: publicURL.publicUrl };
      })
    );

    const formattedLinks = formatLinks(updatedLinks);
    res.json({ links: formattedLinks });
  } catch (err) {
    console.error("Error: ", err);
  }
});

exports.visited_link = [
  body("userID").trim().escape(),
  body("id").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      await prisma.Link.update({
        where: {
          id: req.body.id,
          userId: req.body.userID,
        },

        data: {
          visits: { increment: 1 },
        },
      });

      res.status(200).json({});
    }
  }),
];

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
  body("userID").trim().escape(),
  body("massTitle").trim(),
  body("massFolder").trim().escape(),
  body("massBookmark").trim().escape(),
  body("massIDs").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

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
              userId: req.body.userID,
            },

            data: {
              title: req.body.massTitle || undefined,
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
  body("userID").trim().escape(),
  body("massDelete").trim().escape(),
  body("massRestore").trim().escape(),
  body("massIDs").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);
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
              userId: req.body.userID,
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
