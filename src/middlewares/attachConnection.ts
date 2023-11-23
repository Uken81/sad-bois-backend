import { Response, NextFunction, Request } from 'express';
import { waitForConnection } from '../server';

export const attachConnection = async (req: Request, res: Response, next: NextFunction) => {
  console.log('*****attaching connection*****');
  try {
    const connection = await waitForConnection();
    if (!connection) {
      throw new Error('Failed to get database connection');
    }

    req.dbConnection = connection;

    next();
  } catch (error) {
    console.error('Failed to get database connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
