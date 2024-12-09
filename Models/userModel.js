const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter a username"],
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please enter a confirmation password"],
    select: false,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpiresAt: Date,
});

// Encrypt Password before saving to database.
userSchema.pre("save", async function (next) {
  // If password is not changed then don't encrypt it again.
  if (!this.isModified("password")) return next();

  // encrypt the password.
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

// Change the passwordChangedAt property.
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// Check if password is correct.
userSchema.methods.correctPassword = async function (
  canidatePassword,
  userPassword
) {
  return await bcrypt.compare(canidatePassword, userPassword);
};

// Check if password didn't change after token was issued.

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    // Convert the passwordChangedAt from milliseconds to a proper timestamp.
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < changedTimeStamp;
  }

  // Mean Not Changed
  return false;
};

// Create a random reset token.

userSchema.methods.createPasswordResetToken = function () {
  // Create a random reset token.
  const randomToken = crypto.randomBytes(32).toString("hex");

  // Encrypt the passwordResetToken and save it to database.
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(randomToken)
    .digest("hex");

  // Set Expiration date of 10 min to the reset token.
  this.passwordResetTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  return randomToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
