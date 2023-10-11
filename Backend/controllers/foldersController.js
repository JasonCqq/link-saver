const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/prismaClient");

exports.get_folder = asyncHandler(async (req, res) => {
  console.log(req.session.user);
  if (req.session.user.id === req.params.userId) {
    console.log(req.session.user);

    const folders = await prisma.Folder.findMany({
      where: {
        userId: `${req.params.userId}`,
      },
    });

    return res.json({ folders: folders });
  } else {
    return res.json({ error: "Forbidden" });
  }
});
