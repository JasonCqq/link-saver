require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

// Routes
const homeRouter = require("./routes/home");
const userRouter = require("./routes/user");
const folderRouter = require("./routes/folder");
const linkRouter = require("./routes/link");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: `${process.env.FRONT_END}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Routes
app.use("/", homeRouter);
app.use("/user", userRouter);
app.use("/folder", folderRouter);
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
