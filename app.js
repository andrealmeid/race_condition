
const express = require("express");
const path = require("path");
const createError = require("http-errors");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");

const app = express();

/** 
 * VIEW ENGINE
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** 
 * MIDDLEWARES 
 */
// Configure logger
app.use(logger("dev"));

// Configure json body parsing
app.use(express.json());

// Configure form-urlencoded body parsing
app.use(express.urlencoded({ extended: false }));

// Configure static files provider
app.use(express.static(path.join(__dirname, "public")));

/**
 * ROUTES
 */
app.use("/", indexRouter);
app.use("/api", apiRouter);

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
	res.render("error");
});

module.exports = app;
