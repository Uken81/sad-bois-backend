import { Response, NextFunction, Request } from 'express';
import { waitForConnection } from '../server';

export const attachConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = await waitForConnection();
    req.dbConnection = connection;

    next();
  } catch (error) {
    console.error('Failed to get database connection:', error);
    res.status(500).json({ error: 'Internal server error' });
    // next();
  }
};
