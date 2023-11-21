import { Connection } from 'mysql2';

declare module 'express-serve-static-core' {
  interface Request {
    dbConnection: Connection | null;
  }
}
