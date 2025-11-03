const AppError = require("../Utils/appError");
const catchAsync = require("./../Utils/catchAsync");
const User = require("./../Models/userModel");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  if (!users)
    return next(new AppError("Users not found please try again later", 404));

  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
  });
});
exports.getUser = catchAsync(async (req, res, next) => {});
exports.createUser = catchAsync(async (req, res, next) => {});
exports.deleteUser = catchAsync(async (req, res, next) => {});
exports.updateUser = catchAsync(async (req, res, next) => {});
