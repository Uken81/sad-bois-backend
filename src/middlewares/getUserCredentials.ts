import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../Utils/verifyToken';

export interface UserCredentials {
  isLoggedIn: boolean;
  id: string | null;
}

export const getUserCredentials = async (req: Request, res: Response, next: NextFunction) => {
  const jwtCookie = req.cookies;
  if (!jwtCookie || !jwtCookie.jwt) {
    console.log('no cookie');
    req.userCredentials = {
      isLoggedIn: false,
      id: null
    };

    next();
    return;
  }

  try {
    const token = await verifyToken(jwtCookie.jwt);
    if (typeof token.userId !== 'string' || token.userId === '') {
      console.log('Invalid token: token is not a string or is an empty string');
      return res.status(400).json({ message: 'Unauthorized: Invalid token' });
    }

    req.userCredentials = {
      isLoggedIn: true,
      id: token.userId
    };

    next();
  } catch (error) {
    console.error('Error verifying token: ', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
