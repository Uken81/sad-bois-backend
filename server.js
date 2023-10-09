const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // Enable cookies and other credentials in CORS requests
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const connection = mysql.createConnection(process.env.DATABASE_URL);
connection.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MYSQL connected....");
  }
});

module.exports = connection;

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

const productsRouter = require("./routes/products");
app.use("/products", productsRouter);

const newsRouter = require("./routes/news");
app.use("/news", newsRouter);

app.listen(2001, () => {
  console.log("server running");
});
