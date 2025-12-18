var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const otpController = require("../controllers/otpController");
const crypto = require("crypto");

router.post("/create", userController.create_user);

router.get("/logout", userController.logout_user);

router.get("/settings/:userId", userController.get_settings);

router.post("/login", userController.login_user);

// Forgot Password Process
router.post("/forgot_password", otpController.generateOTP);

router.post("/verify_otp", otpController.verifyOTP);

router.post("/change_password_otp", userController.change_password_otp);

const securityCheck = require("../routes/routeAuthenticate");
router.use(securityCheck.authenticateReq);

router.delete("/delete_account", userController.delete_user);

router.put("/change_password", userController.change_password);

// Generate extension token (user must be logged in via Passport session)
router.post("/extension/generate-token", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ error: "Not logged in", redirectTo: "/login" });
  }

  try {
    // Generate random token
    const token = crypto.randomBytes(32).toString("hex");

    // Save to database
    await prisma.User.update({
      where: { id: req.user.id },
      data: {
        extensionToken: token,
        extensionTokenCreatedAt: new Date(),
      },
    });

    res.json({
      token: token,
      user: {
        id: req.user.id,
        username: req.user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Verification middleware function
// async function verifyExtensionToken(req, res, next) {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ error: "No token provided" });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//       // Find user by extension token
//       const user = await prisma.user.findUnique({
//         where: { extensionToken: token }
//       });

//       if (!user) {
//         return res.status(401).json({ error: "Invalid token" });
//       }

//       // Optional: Check if token expired (30 days)
//       const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
//       if (user.extensionTokenCreatedAt < thirtyDaysAgo) {
//         return res.status(401).json({ error: "Token expired" });
//       }

//       req.user = user;
//       next();
//     } catch (error) {
//       res.status(500).json({ error: "Authentication failed" });
//     }
//   }

//   // Example protected route for extension
//   app.get('/api/extension/user-data', verifyExtensionToken, (req, res) => {
//     res.json({
//       user: {
//         id: req.user.id,
//         username: req.user.username
//         // ... other safe user data
//       }
//     });
//   });

module.exports = router;
