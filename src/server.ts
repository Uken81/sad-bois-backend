import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { Connection, createConnection } from 'mysql2';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import newsRouter from './routes/news';
import tourRouter from './routes/tour';
import { promisify } from 'util';
import { checkConnection } from './Utils/checkConnection';

config();

let connectionReady = false;
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

let connection: Connection | null = null;

const initialiseDatabase = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set in the environment variables');
    }

    const databaseConnection: Connection = createConnection(databaseUrl);
    const connectAsync = promisify(databaseConnection.connect).bind(databaseConnection);

    await connectAsync();
    console.log('MYSQL connected....');
    return databaseConnection;
  } catch (error) {
    console.error('Error initialising database:', error);
    return null;
    //Todo: Maybe do a retry process. Research how to implement an exit process so backend doesnt crash.
  }
};

const startServer = async () => {
  try {
    const dbConnection = await initialiseDatabase();
    connection = checkConnection(dbConnection);
    // console.log('ok', connection);
    connectionReady = true;

    app.use('/auth', authRouter);
    app.use('/products', productsRouter);
    app.use('/news', newsRouter);
    app.use('/tour', tourRouter);

    app.listen(2001, () => {
      console.log('server running');
    });

    // return connection;
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();

export const waitForConnection = async () => {
  while (!connectionReady) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  console.log('serverConnection');
  return connection;
};
//delete this when other comps updated!!
export default connection;
