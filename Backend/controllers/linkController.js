const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const prisma = require("../prisma/prismaClient");
const { decode } = require("html-entities");
const sharp = require("sharp");
const fetch = require("node-fetch-commonjs");

const ogs = require("open-graph-scraper");

// Supabase
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
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
  body("remind").trim().escape(),
  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      let date = req.body.remind;
      if (date === "") {
        date = null;
      }

      let decodedUrl = decode(req.body.url, { level: "html5" });
      console.log(req.body.url, decodedUrl);

      if (
        !decodedUrl.startsWith("http://") &&
        !decodedUrl.startsWith("https://")
      ) {
        decodedUrl = "https://" + decodedUrl;
      }

      // Scrape for title/screenshot
      let thumbnail = "";
      let title = "";
      try {
        console.time("fetch");

        const options = {
          url: decodedUrl,
          onlyGetOpenGraphInfo: true,
        };

        ogs(options)
          .then(async (data) => {
            const { error, html, result, response } = data;
            console.timeEnd("fetch");

            if (!result.ogTitle && !result.ogSiteName) {
              title = result.requestUrl;
            } else {
              title = result.ogSiteName || result.ogTitle;
            }

            console.log(result);

            if (result.ogImage && result.ogImage[0]) {
              console.time("image fetch");
              const imageResponse = await fetch(result.ogImage[0].url);
              const imageBuffer = await imageResponse.arrayBuffer();
              console.timeEnd("image fetch");

              console.time("sharp");
              try {
                thumbnail = await sharp(Buffer.from(imageBuffer))
                  .resize(200, 200)
                  .webp({ quality: 40 })
                  .toBuffer();
              } catch (err) {
                thumbnail = "";
              }
              console.timeEnd("sharp");
            }

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
                remind: date,
                thumbnail: "",
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

              const { error } = await supabase.storage
                .from("thumbnails")
                .upload(imagePath, thumbnail, {
                  contentType: "image/webp",
                });

              console.timeEnd("supabase");
              if (error) {
                console.error("Supabase Error: ", error);
              } else {
                const updatedLink = await prisma.Link.update({
                  where: {
                    id: linkID,
                  },
                  data: {
                    thumbnail: imagePath,
                    pURL: publicUrl,
                  },
                });

                res.status(200).json({ link: updatedLink });
              }
            }
          })
          .catch(async (error) => {
            console.error(error);

            console.time("database operation2");
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
                remind: date,
                thumbnail: "",
              },
            });
            console.timeEnd("database operation2");
            res.status(200).json({ link: link });
          });
      } catch (error) {
        console.error("Error fetching or processing:", error);
        res.status(500).json("Server Error");
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
  body("remind").trim().escape(),

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
          remind: req.body.remind || null,
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
      }),
    );

    const formattedLinks = formatLinks(updatedLinks);
    res.status(200).json({ links: formattedLinks });
  } catch (err) {
    console.error("Error: ", err);
  }
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
  body("userID").trim().escape(),
  body("massTitle").trim(),
  body("massRemind").trim().escape(),
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
