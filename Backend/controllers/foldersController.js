const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/prismaClient");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

function formatLinks(links) {
  links.map((link) => {
    link.url = link.url.replace("www.", "");
    link.url = link.url.replace(/^(https?:\/\/)/, "");
    link.createdAt = link.createdAt.toLocaleDateString("en-US");
    return link;
  });

  return links;
}

exports.get_folder = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }

  let folders = await prisma.Folder.findMany({
    where: {
      userId: req.params.userId,
    },
    include: {
      links: {
        where: { trash: false },
      },
    },
  });

  folders = folders.map((folder) => {
    folder.links = formatLinks(folder.links);
    return folder;
  });

  res.status(200).json({ folders: folders });
});

exports.create_folder = [
  body("name").trim().escape(),

  asyncHandler(async (req, res) => {
    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errs.array().map((err) => err.msg) });
    } else {
      try {
        if (!req.params.userId || req.session.user.id !== req.params.userId) {
          res.status(401).send("Not authenticated");
        }

        const folder = await prisma.Folder.create({
          data: {
            name: req.body.name,

            user: {
              connect: { id: req.params.userId },
            },
          },
        });

        return res.status(200).json({});
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
      return res
        .status(400)
        .json({ errors: errs.array().map((err) => err.msg) });
    } else {
      try {
        if (!req.params.userId || req.session.user.id !== req.params.userId) {
          res.status(401).send("Not authenticated");
        }

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

    return res.status(200).json({});
  }),
];

exports.delete_folder = asyncHandler(async (req, res) => {
  try {
    if (!req.params.userId || req.session.user.id !== req.params.userId) {
      res.status(401).send("Not authenticated");
    }

    const folder = await prisma.Folder.delete({
      where: {
        id: req.params.folderId,
        userId: req.params.userId,
      },
    });
    return res.status(200).json({});
  } catch (err) {
    console.log(err);
  }
});

exports.search_folder_links = asyncHandler(async (req, res) => {
  if (!req.params.userId || req.session.user.id !== req.params.userId) {
    res.status(401).send("Not authenticated");
  }

  const query = req.query.q;

  const links = await prisma.Link.findMany({
    where: {
      userId: req.params.userId,
      folderId: req.params.folderId,
      AND: [
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

exports.get_shared_folder = asyncHandler(async (req, res) => {
  try {
    const sharedFolder = await prisma.Share.findUnique({
      where: {
        id: JSON.parse(req.params.id),
        public: true,
      },

      include: {
        folder: { include: { links: true } },
        user: true,
      },
    });

    if (sharedFolder.password) {
      res.status(401).json({ message: "Password required" });
    } else if (!sharedFolder.password) {
      const formattedLinks = formatLinks(sharedFolder.folder.links);

      res.status(200).json({
        folderName: sharedFolder.folder.name,
        authorName: sharedFolder.user.username,
        links: formattedLinks,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

exports.create_shared_folder = [
  body("password").trim().escape(),
  body("share").trim().escape(),

  asyncHandler(async (req, res) => {
    if (!req.params.userId || req.session.user.id !== req.params.userId) {
      res.status(401).send("Not authenticated");
    }

    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errs.array().map((err) => err.msg) });
    } else {
      // Hash Password
      let password = req.body.password;

      if (password) {
        try {
          password = await bcrypt.hash(password, 10);
        } catch (err) {
          return res.status(500).json({
            error: "Error Hashing Password. (Bcrypt Error)",
          });
        }
      }

      await prisma.$transaction(async (prisma) => {
        const folder = await prisma.Folder.update({
          where: {
            id: req.params.folderId,
          },

          data: {
            private: false,
          },

          include: {
            shares: true,
          },
        });

        const share = await prisma.Share.upsert({
          where: {
            id: folder.shares.id,
          },

          update: {
            public: true,
            password: password,
          },

          create: {
            folder: {
              connect: {
                id: req.params.folderId,
              },
            },

            public: JSON.parse(req.body.share),

            user: {
              connect: {
                id: req.params.userId,
              },
            },

            password: password,
          },
        });

        res.status(200).json({ url: share.id });
      });
    }
  }),
];

exports.unshare_folder = [
  body("share").trim().escape(),

  asyncHandler(async (req, res) => {
    if (!req.params.userId || req.session.user.id !== req.params.userId) {
      res.status(401).send("Not authenticated");
    }

    const errs = validationResult(req);

    if (!errs.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errs.array().map((err) => err.msg) });
    } else {
      try {
        await prisma.Folder.update({
          where: {
            id: req.params.folderId,
          },

          data: {
            private: JSON.parse(req.body.share),

            shares: {
              update: {
                public: false,
                password: null,
              },
            },
          },
        });
      } catch (err) {
        console.log(err);
      }

      res.status(200).json();
    }
  }),
];

exports.get_authorized_folder = [
  body("password").trim().escape(),

  asyncHandler(async (req, res) => {
    const folder = await prisma.Share.findUnique({
      where: {
        id: JSON.parse(req.params.id),
        public: true,
      },

      include: {
        folder: { include: { links: true } },
        user: true,
      },
    });

    const check = await bcrypt.compare(req.body.password, folder.password);

    if (check) {
      const formattedLinks = formatLinks(folder.folder.links);

      res.status(200).json({
        folderName: folder.folder.name,
        authorName: folder.user.username,
        links: formattedLinks,
      });
    } else {
      res.status(401).json({ message: "Incorrect Password" });
    }
  }),
];
