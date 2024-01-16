import { Response, Request, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import { checkConnection } from '../Utils/checkConnection';

interface DecodedToken {
  email: string;
  iat: number;
  exp: number;
}

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not correctly set in the environment variables');
  }

  const verifyToken = (token: string, secret: jwt.Secret): Promise<DecodedToken> => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err: Error | null, decoded: any) => {
        if (err) {
          console.error('Error verifying token', err);
          reject(new Error(err.message));
        }

        if (!decoded) {
          reject(new Error('Token is null or not decoded properly'));
        }

        resolve(decoded as DecodedToken);
      });
    });
  };

  try {
    const decoded = await verifyToken(req.cookies.jwt, jwtSecret);
    console.log('decoded', decoded);

    const query = 'SELECT * FROM users WHERE email = ?';
    const connection = checkConnection(req.dbConnection);
    connection.query(
      query,
      [decoded.email],
      async (err: Error | null, results: RowDataPacket[]) => {
        if (err) {
          console.error('Error querying the database:', err);
          res.status(500).json({ message: 'Server error', type: 'network' });
          return;
        }

        if (!results || results.length === 0) {
          console.error('No user found');
          return res.status(404).json('No user with that ID found');
        }

        if (results.length > 1) {
          return res.status(500).json('Multiple users with same id found');
        }

        req.isUserValidated = true;
        next();
      }
    );
  } catch (error) {
    console.error('error', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
