const asyncHandler = require("express-async-handler");

exports.authenticateReq = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    // User is logged in via session
    return next();
  }
  // No session, check for extension token
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const user = await prisma.User.findUnique({
        where: { extensionToken: token },
      });

      if (user) {
        req.user = user; // Attach user to request
        return next();
      }
    } catch (error) {
      console.error("Token verification error:", error);
    }
  }

  // Neither session nor token worked
  return res.status(401).json({ error: "Not authenticated" });
});
