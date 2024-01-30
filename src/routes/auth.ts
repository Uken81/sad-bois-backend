import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateToken } from '../middlewares/authMiddleware';
import { isResultEmpty } from '../Utils/isResultEmpty';
import { UserType } from '../Types/expressTypes';
import { pool } from '../server';
import { QueryResult } from 'pg';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email, username, password, confirmedPassword } = req.body;

  if (!email || !username || !password || !confirmedPassword) {
    return res.status(400).json({ message: 'Missing form data' });
  }

  if (password !== confirmedPassword) {
    return res.status(400).json({
      message: 'Passwords do not match.',
      type: 'password'
    });
  }

  const duplicteQuery = 'SELECT email FROM users WHERE email = $1';
  pool?.query(duplicteQuery, [email], async (err: Error | null, results: QueryResult) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({
        error: 'Database error occured',
        type: 'network',
        details: err.message
      });
    }

    if (results.rows.length > 0) {
      return res.status(400).json({
        message: 'Email already registered',
        type: 'duplicateEmail'
      });
    }

    const passwordHashed = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (email, username, password) VALUES ($1, $2, $3)';
    pool?.query(query, [email, username, passwordHashed], (err: Error | null) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({
          error: 'Database error occured',
          type: 'network',
          details: err.message
        });
      }

      return res.status(200).json({ message: 'Data inserted successfully' });
    });
  });
});

router.post('/login', async (req: Request, res: Response) => {
  const jwtSecret = process.env.JWT_SECRET;
  const cookieExpireTime = Number(process.env.JWT_COOKIE_EXPIRES);

  if (!jwtSecret) {
    console.error('JWT_SECRET is not correctly set in the environment variables');
    return res.status(500).json({
      message: 'Database error occured',
      type: 'network'
    });
  }

  if (isNaN(cookieExpireTime)) {
    console.error('JWT_COOKIE_EXPIRES is not set correctly in the environment variables');
    return res.status(500).json({
      message: 'Database error occured',
      type: 'network'
    });
  }

  const { email, password } = req.body;

  const query = 'SELECT username, email, password FROM users WHERE email = $1';
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
      const token = jwt.sign({ email: user.email }, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      const cookieOptions = {
        expires: new Date(Date.now() + cookieExpireTime * 24 * 60 * 60 * 1000),
        httpOnly: true
      };
      res.cookie('jwt', token, cookieOptions);
      return res.status(200).json({
        message: 'Login successful',
        user: { username: user.username, email: user.email }
      });
    }
  });
});

router.get('/validate', validateToken, async (req: Request, res: Response) => {
  const isValidated = req.isUserValidated;

  if (!isValidated) {
    return res.status(401).json({ validationSuccess: false, message: 'Not authorized' });
  }

  return res.status(200).json({
    validationSuccess: true,
    message: 'Successfully validated user.'
  });
});

router.get('/logout', (req: Request, res: Response) => {
  try {
    res.cookie('jwt', 'logout', {
      expires: new Date(Date.now() + 2 * 1000),
      httpOnly: true
    });

    return res.status(200).json({ message: 'User logged out' });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ message: 'Error logging out' });
  }
});

export default router;
