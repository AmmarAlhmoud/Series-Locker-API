const express = require("express");
const usersController = require("./../Controllers/usersController");
const authController = require("./../Controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// router
//   .route("/")
//   .get(authController.protect, usersController.getAllUsers)
//   .post(usersController.createUser);
// router
//   .route("/:id")
//   .get(usersController.getUser)
//   .patch(usersController.updateUser)
//   .delete(usersController.deleteUser);

module.exports = router;
