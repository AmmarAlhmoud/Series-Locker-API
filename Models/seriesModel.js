const mongoose = require("mongoose");
const slugify = require("slugify");

const seriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A series must have a name"],
  },
  slug: String,
  url: {
    type: String,
    required: [true, "A series must have a url"],
  },
  country: {
    type: String,
    required: [true, "A series must have a country"],
  },
  watchingType: {
    type: String,
    required: [true, "A series must have a watching type"],
    enum: ["watched", "planning to watch"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  dateOfWatching: Date,
  dateOfAdding: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});


seriesSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Series = mongoose.model("Series", seriesSchema);

module.exports = Series;
