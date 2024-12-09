const AppError = require("./../Utils/appError");

const handleJWTError = () =>
  new AppError("Invalid token. please login again!", 401);

const handleTokenExpiredError = () =>
  new AppError("Your token has expired! please login again", 401);

const handleCastErrorDB = (err) => {
  // For invalid IDs.
  const message = `Invalid ${err.path}: ${err.value}`;

  // 400 status code for bad request.
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  // For duplicate fields.
  const values = Object.values(err.keyValue);
  // const message = `You have added this series name before: ${values.join(
  //   " "
  // )}. Please use another name`;
  const message = `You have added this series name before. Please use another name`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // For validation errors.
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data: ${errors.join(". ")}`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational error it's error we implement and we send them to the client.
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming error or error cased by unknown resource.

    // 1) log the error
    console.error("Error 💥", err);

    // 2) send generic message
    res.status(500).json({
      status: "error",
      message: "Somthing went wrong 💥",
    });
  }
};

module.exports = (err, req, res, next) => {
  // basically the stack is information about where the error occurred.
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // To give us a thorough (complete) error when we are developing our app.
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
    // To give the client a better error message.
  } else if (process.env.NODE_ENV === "production") {
    // to make a copy of the err object.

    // let error = JSON.parse(JSON.stringify(err));

    let error = err;


    // let error = { ...err };  this doesn't work for some reason.

    // To handle Database errors.
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    // To handle authentication errors.
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }

  next();
};
