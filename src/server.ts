import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { createConnection } from 'mysql2';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import newsRouter from './routes/news';
import { Connection } from 'mysql2/typings/mysql/lib/Connection';
import { promisify } from 'util';
import tourRouter from './routes/tour';
import processOrderRouter from './routes/process-order';
import ordersRouter from './routes/orders';

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

const initialiseDatabase = async () => {
  console.log('*****Initialising database*****');

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

export let connection: Connection | null = null;
const startServer = async () => {
  console.log('*****starting server*****');

  try {
    const dbConnection = await initialiseDatabase();
    if (!dbConnection) {
      throw new Error('Error initialising database');
    }

    connection = dbConnection;

    app.use('/auth', authRouter);
    app.use('/products', productsRouter);
    app.use('/news', newsRouter);
    app.use('/tour', tourRouter);
    app.use('/process-order', processOrderRouter);
    app.use('/orders', ordersRouter);

    // app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    //   if (!err) {
    //     return next();
    // }
    //   console.log(err);
    //   res.status(500).json({ error: `Internal server error: ${err}` });
    // })

    let port = process.env.PORT;
    if (port == null || port == '') {
      port = '2001';
    }
    app.listen(port, () => {
      console.log('server running');
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
  }
};

startServer();
