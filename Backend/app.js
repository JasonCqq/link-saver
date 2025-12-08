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

// Routes
const homeRouter = require("./routes/home");
const userRouter = require("./routes/user");
const folderRouter = require("./routes/folders");
const linkRouter = require("./routes/link");
const urlRouter = require("./routes/url");
const preferencesRouter = require("./routes/preferences");

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

io.on("connection", (socket) => {
  console.log("user connected");
});
app.set("io", io);

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

// Routes
app.use("/", homeRouter);
app.use("/user", userRouter);
app.use("/folders", folderRouter);
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
