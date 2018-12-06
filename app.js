const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const config = require("./config/config");

const indexRouter = require("./routes/index");
const apiRouterV1 = require("./routes/api/v1/index");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// set mongodb
mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);
mongoose.connect(
  config.mongoDbUri,
  {
    useNewUrlParser: true
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongoDB connection error:"));
db.once("open", () => console.log("Connected to mongodb Atlas"));

app.use("/", indexRouter);
app.use("/api/v1", apiRouterV1);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    message: err.message,
    error: err
  });
});

module.exports = app;
