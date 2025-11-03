const express = require("express");
const seriesController = require("./../Controllers/seriesController");
const authController = require("./../Controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, seriesController.getAllSeries)
  .post(authController.protect, seriesController.createSeries);
router
  .route("/:id")
  .get(authController.protect, seriesController.getSeries)
  .patch(authController.protect, seriesController.updateSeries)
  .delete(authController.protect, seriesController.deleteSeries);

module.exports = router;
