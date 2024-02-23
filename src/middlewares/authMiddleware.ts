import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../server';
import { QueryResult } from 'pg';

interface DecodedToken {
  email: string;
  iat: number;
  exp: number;
}

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not correctly set in the environment variables');
      return res.status(500).json({
        message: 'Internal server error. Please try again later.',
        type: 'configuration_error'
      });
    }

    const verifyToken = (token: string, secret: jwt.Secret): Promise<DecodedToken> => {
      return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err: Error | null, decoded: unknown) => {
          if (err) {
            console.error('Error verifying token', err);
            reject(new Error(err.message));
          }

          if (!decoded) {
            console.error('Error decoding token');
            reject(new Error('Token is null or not decoded properly'));
          }

          resolve(decoded as DecodedToken);
        });
      });
    };

    const decoded = await verifyToken(req.cookies.jwt, jwtSecret);

    const query = 'SELECT * FROM users WHERE email = $1';
    pool?.query(query, [decoded.email], async (err: Error | null, results: QueryResult) => {
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
        return res.status(500).json({ message: 'Multiple users with same id found' });
      }

      req.isUserValidated = true;
      next();
    });
  } catch (error) {
    console.error('error', error);
    return res.status(401).json({ message: `Unexpected error validating token: ${error}` });
  }
};
