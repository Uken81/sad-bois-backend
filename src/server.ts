import express, { json, urlencoded } from "express";
import cors from "cors";
import { createConnection } from "mysql2";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import newsRouter from "./routes/news";
import tourRouter from "./routes/tour";

config();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());
//Allows x-www-form-urlencoded data from Postman to be parsed
app.use(urlencoded({ extended: true }));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log("about to throw");
  throw new Error("DATABASE_URL is not set in the environment variables");
}

const connection = createConnection(databaseUrl);

// try {

// } catch (error) {

// }
connection.connect((error) => {
  if (error) {
    console.error("err", error);
  } else {
    console.log("MYSQL connected....");
  }
});

//should i create a try/catch here?

app.use("/auth", authRouter);

app.use("/products", productsRouter);

app.use("/news", newsRouter);

app.use("/tour", tourRouter);

app.listen(2001, () => {
  console.log("server running");
});

export default connection;
