require ('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const path = require('path');
const userRoute = require("./routes/userRoute");
const perimeterRoute = require("./routes/perimeterRoute");
const shiftRoute = require('./routes/shiftRoute');
const managerRoute  = require('./routes/managerRoute');

const app = express();

// Use environment variables or fallback defaults
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/healthcare";
const PORT = process.env.PORT || 3000;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.log("MongoDB connection error:", e));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use("/", userRoute);
app.use("/", perimeterRoute);
app.use("/", managerRoute);
app.use("/", shiftRoute);


app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
