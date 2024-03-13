import { Connection } from 'mysql2';
import { UserCredentials } from '../middlewares/getUserCredentials';

export interface UserType {
  id: string;
  email: string;
  username: string;
  password: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    dbConnection: Connection | null;
    user?: UserType;
    isUserValidated?: boolean;
    userCredentials?: UserCredentials;
  }
}
