const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(2001, () => {
  console.log("server running");
});
