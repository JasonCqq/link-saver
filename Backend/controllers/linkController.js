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

async function createSingleLink({
  rawUrl,
  userId,
  folderId = null,
  bookmarked = false,
  io,
}) {
  let decodedUrl = decode(rawUrl, { level: "html5" });

  if (!decodedUrl.startsWith("http://") && !decodedUrl.startsWith("https://")) {
    decodedUrl = "https://" + decodedUrl;
  }

  let title = "";
  let thumbnail = null;
  let page;
  let browser;

  try {
    /* ================= FAST FETCH ================= */
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(decodedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeoutId);
    const html = await response.text();

    if (
      html.includes("Just a moment") ||
      html.includes("cf-browser-verification") ||
      html.length < 500
    ) {
      throw new Error("Bot detection");
    }

    const extractMeta = (property) => {
      const regex = new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
        "i"
      );
      return html.match(regex)?.[1] ?? null;
    };
    title =
      extractMeta("og:title") ||
      extractMeta("twitter:title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      "";

    thumbnail = extractMeta("og:image") || extractMeta("twitter:image");
  } catch {
    /* ================= PLAYWRIGHT FALLBACK ================= */

    browser = await getBrowser();
    page = await browser.newPage();

    await page.goto(decodedUrl, { waitUntil: "domcontentloaded" });

    const metadata = await page.evaluate(() => ({
      ogTitle:
        document.querySelector('meta[property="og:title"]')?.content ??
        document.title,
      ogImage:
        document.querySelector('meta[property="og:image"]')?.content ?? null,
    }));

    title = metadata.ogTitle;
    thumbnail = metadata.ogImage;
  }

  /* ================= IMAGE HANDLING ================= */

  let imageBuffer;

  if (thumbnail) {
    try {
      const imgRes = await fetch(thumbnail);
      imageBuffer = Buffer.from(await imgRes.arrayBuffer());
    } catch {
      thumbnail = null;
    }
  }

  if (!thumbnail) {
    if (!page) {
      browser ??= await getBrowser();
      page = await browser.newPage();
      await page.goto(decodedUrl, { waitUntil: "load" });
    }
    imageBuffer = await page.screenshot({ type: "png" });
  }

  const processedImage = imageBuffer
    ? await sharp(imageBuffer).webp({ quality: 75 }).toBuffer()
    : null;

  console.log("test");
  if (page) await page.close();
  console.log("test2");
  /* ================= DATABASE ================= */
  title = decode(title || "", { level: "html5" });
  try {
    const link = await prisma.Link.create({
      data: {
        url: decodedUrl,
        title: title,
        bookmarked: bookmarked,
        visits: 0,
        thumbnail: "",
        user: { connect: { id: userId } },
        ...(folderId && { folder: { connect: { id: folderId } } }),
      },
    });

    console.log("HII");
    if (processedImage) {
      const imagePath = `thumbnails/${userId}/${link.id}`;
      const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/thumbnails/${imagePath}`;

      const updatedLink = await prisma.Link.update({
        where: { id: link.id },
        data: {
          thumbnail: imagePath,
          pURL: publicUrl,
        },
      });

      if (processedImage) {
        uploadThumbnailAsync(link.id, processedImage, userId, io).catch((err) =>
          console.error(`Thumbnail upload failed for ${link.id}:`, err)
        );
      }

      console.log("HII");

      io.emit("thumbnail-ready", updatedLink);
    }
    console.log("HII");
    return link;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function uploadThumbnailAsync(linkId, imageBuffer, userId, io) {
  const imagePath = `thumbnails/${userId}/${linkId}`;
  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/thumbnails/${imagePath}`;

  await supabase.storage.from("thumbnails").upload(imagePath, imageBuffer, {
    contentType: "image/webp",
  });

  const updatedLink = await prisma.Link.update({
    where: { id: linkId },
    data: {
      thumbnail: imagePath,
      pURL: publicUrl,
    },
  });

  io.emit("thumbnail-ready", updatedLink);
  console.log(`Thumbnail uploaded for ${linkId}`);
}

exports.create_link = [
  body("userID").trim().escape(),

  body("urls")
    .isArray({ min: 1 })
    .withMessage("URLs must be a non-empty array"),

  body("urls.*").isURL().withMessage("Invalid URL in list"),
  body("folder").trim().escape(),
  body("bookmarked").trim().escape(),
  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      const io = req.app.get("io");
      const success = [];
      const fails = [];

      for (const url of req.body.urls) {
        try {
          const link = await createSingleLink({
            rawUrl: url,
            userId: req.user.id,
            folderId: req.body.folder,
            bookmarked: JSON.parse(req.body.bookmarked),
            io: io,
          });

          if (link) {
            success.push(link);
          } else {
            fails.push(link);
          }
        } catch (err) {
          console.error(err);
        }
      }

      res.status(207).json(success);
    }
  }),
];

exports.parse_link = [
  body("userID").trim().escape(),
  body("id").trim().escape(),
  body("url", "Invalid URL").isURL().trim().isLength({ min: 1 }).escape(),

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

      try {
        console.log("1");
        const browser = await getBrowser();
        const page = await browser.newPage();

        // Navigate to page
        const response = await page.goto(decodedUrl, {
          waitUntil: "domcontentloaded", // Faster than networkidle
          timeout: 10000,
        });

        console.log("2");

        // Check X-Frame-Options header quickly
        const headers = response?.headers();
        const xFrameOptions = headers["x-frame-options"]?.toLowerCase();
        const csp = headers["content-security-policy"]?.toLowerCase();

        // Check if iframe is blocked
        const iframeBlocked =
          xFrameOptions === "deny" ||
          (csp &&
            (csp.includes("frame-ancestors 'none'") ||
              csp.includes("frame-ancestors https:")));

        if (iframeBlocked) {
          // Fallback to Shadow DOM
          console.log("Iframe blocked, using Shadow DOM");

          const content = await page.evaluate(() => {
            document.querySelectorAll("*").forEach((el) => {
              const styles = window.getComputedStyle(el);
              el.setAttribute("style", styles.cssText);
            });

            const fullUrl = window.location.href;
            document.querySelectorAll("img[src]").forEach((img) => {
              try {
                img.src = new URL(img.src, fullUrl).href;
              } catch (e) {}
            });

            return document.documentElement.outerHTML;
          });

          await page.close();

          return res.json({
            method: "shadowdom",
            content: content,
          });
        }

        // Iframe is allowed
        const html = await page.content();
        await page.close();

        res.json({
          method: "iframe",
          content: html,
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
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
        userId: req.user.id,
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
        userId: req.user.id,
      },
    });

    const imagePath = `thumbnails/${req.user.id}/${req.body.id}`;
    const { error } = await supabase.storage
      .from("thumbnails")
      .remove(imagePath);

    if (error) console.error("Supabase delete error:", error.message);

    res.status(200).json({});
  }),
];

exports.perma_delete_all = [
  body("userID").trim().escape(),

  asyncHandler(async (req, res) => {
    // First, get all trashed links with their IDs for deletion
    const trashedLinks = await prisma.Link.findMany({
      where: {
        trash: true,
        userId: req.user.id,
      },
      select: {
        id: true,
        thumbnail: true, // Get the thumbnail path
      },
    });

    // Delete from database
    await prisma.Link.deleteMany({
      where: {
        trash: true,
        userId: req.user.id,
      },
    });

    // Build array of file paths to delete from Supabase
    const filePaths = trashedLinks
      .filter((link) => link.thumbnail) // Only include links that have thumbnails
      .map((link) => link.thumbnail); // Use the stored thumbnail path

    // Delete files from Supabase storage if there are any
    if (filePaths.length > 0) {
      const { error } = await supabase.storage
        .from("thumbnails")
        .remove(filePaths);

      if (error) {
        console.error("Supabase bulk delete error:", error.message);
      } else {
        console.log(`Deleted ${filePaths.length} thumbnails from storage`);
      }
    }

    res.status(200).json({
      deleted: trashedLinks.length,
      thumbnailsDeleted: filePaths.length,
    });
  }),
];

exports.restore_link = [
  body("id").trim().escape(),
  body("userID").trim().escape(),

  asyncHandler(async (req, res) => {
    await prisma.Link.update({
      where: {
        id: req.body.id,
        userId: req.user.id,
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
          userId: req.user.id,
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
  if (!req.params.userId || req.user.id !== req.params.userId) {
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
          userId: req.user.id,
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
  if (!req.params.userId || req.user.id !== req.params.userId) {
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
              userId: req.user.id,
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
              userId: req.user.id,
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
