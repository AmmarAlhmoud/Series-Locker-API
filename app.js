const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const AppError = require("./Utils/appError");
const globalErrorHandler = require("./Controllers/errorController");
const seriesRouter = require("./Routes/seriesRoutes");
const usersRouter = require("./Routes/usersRoutes");
const cors = require("cors");

const app = express();

app.use(cors());
// Set security HTTP headers
app.use(helmet());

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limitRequests = rateLimit({
  // max number of requests
  max: 1000,
  // reset limit after
  windowMs: 60 * 60 * 1000,
  // limit exceeded message
  message:
    "You have reached the maximum limit of requests for this IP. try again in hour",
  proxy: true,
});
// just apply the limit to the /api endpoint and what comes after it.
app.use("/api", limitRequests);

// Body parser, reading data from body into req.body.
// And to limit the size of the req.body data for extra security.
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Data sanitization (clean req body query params) against NoSQL query injection.
app.use(mongoSanitize());

// Data sanitization against xss (html code to attack us).
app.use(xss());

// Prevent parameter pollution (remove duplicate params in request url) we can set excptions,
app.use(
  hpp({
    whitelist: [
      "name",
      "country",
      "watchingType",
      "dateOfWatching",
      "dateOfAdding",
    ],
  })
);

// To compress the text data send to client.
app.use(compression());

app.use("/api/v1/series", seriesRouter);
app.use("/api/v1/users", usersRouter);

// To handle unexisting routes on the server.
app.all("*", (req, res, next) => {
  next(
    new AppError(`Clould not find a ${req.originalUrl} on the server!!`, 404)
  );
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
