import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateToken } from '../../middlewares/authMiddleware';
import { isResultEmpty } from '../../Utils/isResultEmpty';
import { UserType } from '../../Types/expressTypes';
import { pool } from '../../server';
import { QueryResult } from 'pg';
import { checkIfRegistered } from '../../Utils/checkIfRegistered';
import { v4 as uuidv4 } from 'uuid';

interface CookieOptions {
  expires: Date;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'none' | 'lax' | 'strict';
}

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password, confirmedPassword } = req.body;
    if (!email || !username || !password || !confirmedPassword) {
      console.error('Missing form data in login');
      return res.status(400).json({ message: 'Internal Server Error. Please try again later.' });
    }

    if (password !== confirmedPassword) {
      return res.status(400).json({
        message: 'Passwords do not match.',
        type: 'password'
      });
    }

    const isAlreadyRegistered = await checkIfRegistered(email);
    if (isAlreadyRegistered) {
      return res.status(400).json({
        message: 'Email already registered',
        type: 'existing_email'
      });
    }

    const passwordHashed = await bcrypt.hash(password, 10);
    const newUserId = uuidv4();
    const query = 'INSERT INTO users (id, email, username, password) VALUES ($1, $2, $3, $4)';
    pool?.query(query, [newUserId, email, username, passwordHashed], (err: Error | null) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({
          message: 'Internal Server Error. Please try again later.',
          type: 'network',
          details: err.message
        });
      }

      return res.status(200).json({ message: 'Data inserted successfully' });
    });
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      type: 'network'
    });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const cookieExpireTime = Number(process.env.JWT_COOKIE_EXPIRES);

    if (!jwtSecret) {
      console.error('JWT_SECRET is not correctly set in the environment variables');
      return res.status(500).json({
        message: 'Server error',
        type: 'network'
      });
    }

    if (isNaN(cookieExpireTime)) {
      console.error('JWT_COOKIE_EXPIRES is not set correctly in the environment variables');
      return res.status(500).json({
        message: 'Server error',
        type: 'network'
      });
    }

    const { email, password } = req.body;
    if (!email) {
      console.error('Missing required query parameter: email');
      res.status(400).json({
        message: 'Server Error',
        type: 'network'
      });
    }
    if (!password) {
      console.error('Missing required query parameter: password');
      res.status(400).json({
        message: 'Server Error',
        type: 'network'
      });
    }

    const query = 'SELECT id, username, email, password FROM users WHERE email = $1';
    pool?.query(query, [email], async (err: Error | null, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({ message: 'Server error', type: 'network' });
      }

      if (isResultEmpty(results)) {
        return res.status(400).json({ message: 'Invalid email', type: 'email' });
      }

      const row = results.rows[0];
      const user: UserType = {
        id: row.id,
        email: row.email,
        username: row.username,
        password: row.password
      };

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          message: 'Invalid password',
          type: 'password'
        });
      }

      if (passwordMatch) {
        const token = jwt.sign({ userId: user.id }, jwtSecret, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });

        const cookieOptions: CookieOptions = {
          expires: new Date(Date.now() + cookieExpireTime * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: process.env.ENV_STAGE == 'production' ? true : false,
          sameSite: process.env.ENV_STAGE == 'production' ? 'none' : 'lax'
        };
        res.cookie('jwt', token, cookieOptions);
        return res.status(200).json({
          message: 'Login successful',
          user: { username: user.username, email: user.email }
        });
      }
    });
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      type: 'network'
    });
  }
});

router.get('/validate', validateToken, async (req: Request, res: Response) => {
  try {
    const isValidated = req.isUserValidated;
    if (!isValidated) {
      return res.status(401).json({ validationSuccess: false, message: 'Not authorized' });
    }

    return res.status(200).json({
      validationSuccess: true,
      message: 'Successfully validated user.'
    });
  } catch (error) {
    console.error('Unexpected error during validation:', error);
    return res.status(500).json({
      validationSuccess: false,
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

router.get('/logout', (req: Request, res: Response) => {
  try {
    res.cookie('jwt', 'logout', {
      expires: new Date(Date.now() + 2 * 1000),
      httpOnly: true,
      secure: process.env.ENV_STAGE == 'production' ? true : false,
      sameSite: process.env.ENV_STAGE == 'production' ? 'none' : 'lax'
    });

    return res.status(200).json({ message: 'User logged out' });
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

export default router;
