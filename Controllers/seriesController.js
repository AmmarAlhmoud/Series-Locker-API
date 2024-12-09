const catchAsync = require("./../Utils/catchAsync");
const AppError = require("./../Utils/appError");
const APIFeatures = require("./../Utils/apiFeatures");
const Series = require("./../Models/seriesModel");

exports.getAllSeries = catchAsync(async (req, res, next) => {
  // Execute Query Operations
  const features = new APIFeatures(
    Series.find({ user: req.user?._id }),
    req.query
  )
    .filter()
    .search()
    .sort()
    .field()
    .pagination();

  // A query for filtering by specific user and watchingType { watchingType: "watched" }
  // Count Document Logic
  const { country, search, dateOfWatching, dateOfAdding } = { ...req?.query };

  let filterQuery = {};

  if (country !== undefined) {
    filterQuery["country"] = country;
  }
  if (search !== undefined) {
    filterQuery["name"] = { $regex: new RegExp("^" + search, "i") };
  }

  if (dateOfWatching !== undefined) {
    filterQuery["dateOfWatching"] = dateOfWatching;
  }

  if (dateOfAdding !== undefined) {
    filterQuery["dateOfAdding"] = dateOfAdding;
  }

  let docCount = {};
  if (
    country !== undefined ||
    search !== undefined ||
    dateOfWatching !== undefined ||
    dateOfAdding !== undefined
  ) {
    docCount = Series.countDocuments({
      watchingType: req?.query?.watchingType,
      user: req.user?._id,
      ...filterQuery,
    });
  } else {
    docCount = Series.countDocuments({
      watchingType: req?.query?.watchingType,
      user: req?.user?._id,
    });
  }

  const series = features.query;

  const data = await Promise.all([series, docCount]);

  if (!series)
    return next(new AppError("Series not found please try again later", 404));

  res.status(200).json({
    status: "success",
    results: data[0].length,
    data: {
      series: data[0],
      docCount: data[1],
    },
  });
});
exports.getSeries = catchAsync(async (req, res, next) => {
  // change the error message.

  const series = await Series.findOne({ _id: req.params.id, user: req.user?._id });

  if (!series) return next(`This series does not exist.`, 404);

  res.status(200).json({
    status: "success",
    data: {
      series,
    },
  });
});

exports.createSeries = catchAsync(async (req, res, next) => {
  const { name, url, country, watchingType } = req.body;

  const dateOfWatching = req.body.dateOfWatching || "";
  const dateOfAdding = req.body.dateOfAdding || "";


  const existingSeriesForUser = await Series.findOne({
    name,
    user: req.user?._id,
  });

  if (existingSeriesForUser) {
    return next(new AppError("You already have a series with this name.", 401));
  }

  const newSeries = await Series.create({
    name,
    url,
    country,
    watchingType,
    dateOfWatching,
    dateOfAdding,
    user: req.user._id,
  });

  if (!newSeries)
    return next(new AppError("Something went wrong adding series", 404));

  res.status(201).json({
    status: "success",
    message: "New series was added successfully.",
  });
});

exports.deleteSeries = catchAsync(async (req, res, next) => {
  await Series.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.updateSeries = catchAsync(async (req, res, next) => {
  const { name, url, country, watchingType } = req.body;

  const dateOfWatching = req.body.dateOfWatching || "";
  const dateOfAdding = req.body.dateOfAdding || "";

  const series = await Series.findById(req.params.id);

  if (!series) return next(`This series does not exist.`, 404);

  series.name = name || series.name;
  series.url = url || series.url;
  series.country = country || series.country;
  series.watchingType = watchingType || series.watchingType;
  series.dateOfWatching = dateOfWatching || series.dateOfWatching;
  series.dateOfAdding = dateOfAdding || series.dateOfAdding;

  const updateSeries = await series.save();

  res.status(200).json({
    status: "success",
    message: "Series data edited successfully.",
    data: {
      series: updateSeries,
    },
  });
});
