const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AppError = require("./../Utils/appError");
const catchAsync = require("./../Utils/catchAsync");
const User = require("./../Models/userModel");
const Email = require("./../Utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.SECRET_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // To store the cookie data in secure way (hidden), and only send it on https secure conn.
    // secure: true,
    // To just send it to client and store it and send it back with each req.
    httpOnly: true,
  };

  // if we are in production mode we will set secure property to true to send only on https conn.
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // remove password from output.
  user.password = undefined;

  res.status(statusCode).json({ status: "success", token, data: { user } });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  const newUser = await User.create({
    username,
    email,
    password,
    confirmPassword,
  });

  const addWatchedSeriesUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/series`;

  await new Email(newUser, addWatchedSeriesUrl).sendWelcome();

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exists.
  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  // 2) Check if there is user by using the email and grab the password from the database.
  const user = await User.findOne({ email }).select("+password");

  // 3) Check if the user exist && password is correct.
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  // 4) Login user and send token to client.
  res.cookie("hello", "me");
  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Check if there is a token
  let token;

  // const token = req.cookies.jwt; //**second approtch.

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return next(
      new AppError("Your not logged in please login to get access.", 401)
    );

  // 2) Verify if the token is correct.
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);

  // 3) Check if there is a user with this token.
  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );

  // 4) Check if the password didn't change after the token was issued.

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! please login again.", 401)
    );
  }

  // Grant Access to Protected Routes.
  // Append the current user to the req object.
  req.user = currentUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // 1) Check if there is a user with this email.
  const user = await User.findOne({ email });

  if (!user)
    return next(new AppError("There is no user with this email address."), 400);

  // 2) Generate random reset token.
  const resetToken = user.createPasswordResetToken();
  // save the reset token and expiration time to database.
  await user.save({ validateBeforeSave: false });

  // 3) Send the token to the client.

  // const resetUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/users/resetPassword/${resetToken}`;

  const resetUrl = `${process.env.HOST_URL}new-password/${resetToken}`;

  const message = `Hi ${user.username},\n\nWe received a request to reset your password for your account. Click the link below to reset it:\n\n${resetUrl}\n\nIf you didn’t request a password reset, you can safely ignore this email. This link will expire in 10 minutes.\n\nFor security purposes, please do not share this link with anyone.\n\nIf you have any questions, feel free to contact us at ${process.env.USER_EMAIL}.\n\nBest regards,\n\n\nSeries Locker`;

  try {
    // await sendEmail({
    //   email,
    //   subject: "Reset Your Password",
    //   message,
    // });

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Check your email for further instructions.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending your email. Please try again later!."
      ),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user based on the reset token.

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Check if there is a user with this token and if the token is not expired.
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresAt: { $gt: Date.now() },
  });

  // 2) If there is a user and the token is not expired set new password. (The token is invalid or expired.)
  if (!user)
    return next(
      new AppError(
        "Your password reset link has expired. Please request a new one.",
        400
      )
    );

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;

  await user.save();

  // 3) Update the changedAt property of the user.
  // 4) Log user in and send the token to the client.
  createAndSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};
