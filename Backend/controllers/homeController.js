const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/prismaClient");
require("dotenv").config();

exports.user_check = asyncHandler(async (req, res) => {
  if (req.session && req.session.user) {
    const userPreference = await prisma.UserSettings.findUnique({
      where: {
        userId: req.session.user.id,
      },
    });

    res.status(200).json({ user: req.session.user, settings: userPreference });
  } else {
    res.json(null);
  }
});

exports.stat_check = asyncHandler(async (req, res) => {
  const links = await prisma.Link.count();
  const folders = await prisma.Folder.count();

  res.status(200).json({
    links: links,
    folders: folders,
  });
});
