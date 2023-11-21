import express, { Response, Request, NextFunction } from 'express';
import { QueryError, RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { checkConnection } from '../Utils/checkConnection';

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  console.log('cookies', req.cookies);
  const databaseUrl = process.env.DATABASE_URL;

  if (req.cookies.jwt) {
    const connection = checkConnection(req.dbConnection);
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, databaseUrl);
    console.log('decoded', decoded);
    const query = 'SELECT * FROM users WHERE id = ?';
  //   connection.query(query, [decoded.id], async (err: QueryError | null, res: RowDataPacket[]) => {
  //     if (err) {
  //       console.error('Error querying the database:', err);
  //       res.status(500).json({ message: 'Server error' });
  //       return;
  //     }
  //     console.log('resy', res);
  //     if (!res) {
  //       console.log('no user found');
  //       return next();
  //     }

  //     function setUser() {
  //       if (res.length > 1) {
  //         throw new Error('Multiple users with same id found');
  //       }

  //       return res[0];
  //     }
  //     req.user = setUser();
  //     console.log('requser', req.user);
  //     return next();
  //   });
  // } else {
  //   next();
  // }
};
