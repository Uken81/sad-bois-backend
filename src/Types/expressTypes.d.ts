import { Connection } from 'mysql2';

export interface UserType {
  id: number;
  email: string;
  username: string;
  password: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    dbConnection: Connection | null;
    user?: UserType;
    isUserValidated?: boolean;
  }
}
