const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
const app = require("./app");

// For any error doesn't been handled in the app.
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception Shuting Down...💥");
  process.exit(1);
});

// **Database Connection **
const DB = process.env.DATABASE?.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("You successfully connected to MongoDB!😎");
  })
  .catch((err) => console.log(err.message));

// **START SERVER **
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("listening on port " + port);
});

// If there is a server connectionn error.

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection Server Shuting Down... 💥");
  server.close(() => {
    process.exit(1);
  });
});
