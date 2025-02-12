const express = require("express");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const db = require("./config/db");
const cookieParser = require("cookie-parser");
const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

db();
app.use("/auth", authRoutes);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
