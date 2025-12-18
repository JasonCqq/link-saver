const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/prismaClient");
require("dotenv").config();

exports.user_check = asyncHandler(async (req, res) => {
  console.log(req.isAuthenticated?.() ?? false);

  if (req.isAuthenticated()) {
    const userPreference = await prisma.UserSettings.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    return res.status(200).json({ user: req.user, settings: userPreference });
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
});
