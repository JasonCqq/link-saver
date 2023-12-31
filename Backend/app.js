require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

const session = require("express-session");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

// Routes
const homeRouter = require("./routes/home");
const userRouter = require("./routes/user");
const folderRouter = require("./routes/folders");
const linkRouter = require("./routes/link");

var app = express();

app.use(
  cors({
    origin: `${process.env.FRONT_END}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
  }),
);

//Login Authentication
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.User.findUnique({
        where: { username: username },
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
  }),
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
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", homeRouter);
app.use("/user", userRouter);
app.use("/folders", folderRouter);
app.use("/link", linkRouter);

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

module.exports = app;
