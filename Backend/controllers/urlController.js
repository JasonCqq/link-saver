const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/prismaClient");
const { body, validationResult } = require("express-validator");
const { decode } = require("html-entities");

const ogs = require("open-graph-scraper");
const cheerio = require("cheerio");

require("dotenv").config();

exports.get_urls = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).json("Not authenticated");
  }

  try {
    const urls = await prisma.URL.findMany({
      where: {
        userId: req.params.userId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ urls: urls });
  } catch (err) {
    console.error(err);
  }
});

exports.create_urls = [
  body("userID").trim().escape(),
  body("urls").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      const firstError = errs.array({ onlyFirstError: true })[0].msg;
      res.status(400).json(firstError);
    } else {
      // Decodes each url after trim/escape
      let urls = req.body.urls.map((u) => {
        let decodedUrl = decode(u, { level: "html5" });
        if (
          !decodedUrl.startsWith("http://") &&
          !decodedUrl.startsWith("https://")
        ) {
          decodedUrl = "https://" + decodedUrl;
        }

        return decodedUrl;
      });

      // Add scraped title to each url
      const newUrls = await Promise.all(
        urls.map(async (u) => {
          const options = {
            url: u,
            onlyGetOpenGraphInfo: true,
          };

          let title;
          try {
            const data = await ogs(options);
            const { html, result } = data;

            // Get Title
            if (!result.ogTitle && !result.ogSiteName) {
              const $ = await cheerio.load(html);
              title = $("title").text();
            } else {
              title = result.ogTitle || result.ogSiteName;
            }

            return { name: title, url: u };
          } catch (err) {
            console.log(err);
            return { name: u, url: u };
          }
        }),
      );

      await prisma.$transaction(async (p) => {
        for (const u of newUrls) {
          await prisma.URL.create({
            data: {
              title: u.name,
              url: u.url,
              user: {
                connect: {
                  id: req.body.userID,
                },
              },
            },
          });
        }
      });

      res.status(200).json({});
    }
  }),
];

exports.delete_urls = asyncHandler(async (req, res) => {});

exports.deleteAll_urls = asyncHandler(async (req, res) => {});

exports.update_url = asyncHandler(async (req, res) => {});
