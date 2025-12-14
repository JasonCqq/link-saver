require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var cors = require("cors");
var session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const prisma = require("./prisma/prismaClient");

const { createServer } = require("http");
const { Server } = require("socket.io");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const rateLimit = require("express-rate-limit");

// Routes
const homeRouter = require("./routes/home");
const userRouter = require("./routes/user");
const folderRouter = require("./routes/folders");
const linkRouter = require("./routes/link");
const urlRouter = require("./routes/url");
const preferencesRouter = require("./routes/preferences");

const { closeBrowser } = require("./routes/utils/browser.js");

// ========== RATE LIMITERS ==========

// 1. CRITICAL: Authentication (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many authentication attempts, please try again later",
  skipSuccessfulRequests: true,
});

// 2. CRITICAL: Password verification (shared folders)
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many password attempts, please try again later",
  skipSuccessfulRequests: true,
});

// 3. CRITICAL: Email/OTP sending
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many OTP requests, please try again later",
});

// 4. HEAVY: Page parsing/rendering (expensive operation)
const parseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: "Too many parse requests, please slow down",
});

// 5. MODERATE: Account creation
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many signup attempts, please try again later",
});

// 6. GENERAL: API endpoints
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: "Too many requests, please try again later",
  skip: (req) => req.path === "/check", // Skip health check
});

const app = express();

// Web socket
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONT_END,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use(
  cors({
    origin: `${process.env.FRONT_END}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.set("trust proxy", 1);
app.use(
  session({
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // ms
      sameSite: process.env.NODE_ENV === "prod" ? "none" : "lax",
      secure: process.env.NODE_ENV === "prod" ? true : false,
      httpOnly: true,
    },
    secret: `${process.env.DATABASE_SECRET}`,
    resave: true,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      sessionModelName: "Session",
      checkPeriod: 5 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.set("io", io);

// Shutting down database connections, browser, http server, socket
async function gracefulShutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  await io.close();
  await httpServer.close();
  await closeBrowser();
  await prisma.$disconnect();
  process.exit(0);
}

// dev + production
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

//Login Authentication
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.User.findFirst({
        where: {
          OR: [
            {
              email: username,
            },

            {
              username: username,
            },
          ],
        },
      });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // Passwords match!
          return done(null, user);
        } else {
          // Passwords do not match!
          return done(null, false, { message: "Incorrect password" });
        }
      });
    } catch (e) {
      return done(e);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function (id, done) {
  try {
    const user = await prisma.User.findUnique({
      where: { id: id },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(apiLimiter);
// Routes
app.use("/", homeRouter);

app.use("/user/create", signupLimiter); // Signup
app.use("/user/login", authLimiter); // Login
app.use("/user/forgot_password", otpLimiter); // OTP generation
app.use("/user/verify_otp", authLimiter); // OTP verification
app.use("/user/change_password_otp", authLimiter); // Password reset
app.use("/user", userRouter);

app.post("/folders/public/:id", passwordLimiter); // Password verification
app.use("/folders", folderRouter);

app.post("/link/parse", parseLimiter);
app.use("/link", linkRouter);

app.use("/url", urlRouter);
app.use("/preferences", preferencesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
});

// module.exports = app;
module.exports = httpServer;
