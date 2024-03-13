import { Response, Request, NextFunction } from 'express';
import { pool } from '../server';
import { QueryResult } from 'pg';
import { verifyToken } from '../Utils/verifyToken';

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decoded = await verifyToken(req.cookies.jwt);

    const query = 'SELECT * FROM users WHERE id = $1';
    pool?.query(query, [decoded.userId], async (err: Error | null, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        res.status(500).json({ message: 'Server error', type: 'network' });
        return;
      }

      if (!results || !results.rows.length) {
        console.error('No user found');
        return res.status(404).json({ message: 'No user with that ID found' });
      }
      if (results.rows.length > 1) {
        console.error('Multiple users with same id found');
        return res.status(500).json({ message: 'Internal server error' });
      }

      req.isUserValidated = true;
      next();
    });
  } catch (error) {
    console.error('error', error);
    return res.status(401).json({ message: `Unexpected error validating token: ${error}` });
  }
};
