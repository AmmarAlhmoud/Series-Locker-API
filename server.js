const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
const app = require("./app");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception Shutting Down...💥");
  process.exit(1);
});

// Database Connection with ALL deprecated options fixed
const connectDB = async () => {
  const uri = process.env.DATABASE?.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
  );

  if (!uri) {
    throw new Error("Missing DATABASE environment variable");
  }

  mongoose.set("strictQuery", true);

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    writeConcern: {
      w: "majority",
      j: true,
    },
  };

  try {
    await mongoose.connect(uri, options);
    console.log("You successfully connected to MongoDB!😎");

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
};

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    const port = process.env.PORT || 8080;
    const server = app.listen(port, () => {
      console.log(`✅ Server listening on port ${port}`);
    });

    process.on("unhandledRejection", (err) => {
      console.log(err.name, err.message);
      console.log("Unhandled Rejection Server Shutting Down...💥");
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
