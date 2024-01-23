import express, { json, urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import newsRouter from './routes/news';
import tourRouter from './routes/tour';
import processOrderRouter from './routes/process-order';
import ordersRouter from './routes/orders';
import { Pool } from 'pg';

config();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};

const app = express();
app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());
//Allows x-www-form-urlencoded data from Postman to be parsed
app.use(urlencoded({ extended: true }));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const connectToDatabase = () => {
  pool.connect((err) => {
    if (err) {
      console.error('Connection error', err.stack);
      process.exit(1);
    } else {
      console.log('Connected to database');
      startServer();
    }
  });
};

const startServer = () => {
  const port = process.env.PORT || '2004';

  app.listen(port, () => {
    console.log(`server is running on ${port}`);
  });
};

app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/news', newsRouter);
app.use('/tour', tourRouter);
app.use('/process-order', processOrderRouter);
app.use('/orders', ordersRouter);

connectToDatabase();
