import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { validateToken } from "../middlewares/authMiddleware";
import connection from '../server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const router = express.Router();

router.post('/register', async (req, res) => {
  console.log('req', req.body);

  const { email, username, password, confirmedPassword } = req.body;

  if (!email || !username || !password || !confirmedPassword) {
    return res.status(400).json({ message: 'Missing form data' });
  }

  if (password !== confirmedPassword) {
    res.status(400).json({
      message: 'Passwords do not match.',
      success: false,
      type: 'password'
    });
    return;
  }

  const passwordHashed = await bcrypt.hash(password, 10);

  const duplicteQuery = 'SELECT email FROM users WHERE email = ?';
  connection.query(duplicteQuery, [email], async (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ message: 'Server error' });
      return;
    }
    console.log(results);
    // if (results.length > 0) {
    //   res.json({
    //     message: "Email already registered.",
    //     success: false,
    //     type: "email",
    //   });
    //   console.log("duplicate");
    // } else {
    const rows = results as RowDataPacket[];
    if (rows.length > 0) {
      res.status(400).json({
        message: 'Email already registered',
        success: false,
        type: 'email'
      });
      return;
    }

    const query = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';

    connection.query(query, [email, username, passwordHashed], (err, result: ResultSetHeader) => {
      if (err) {
        res.status(500).send('Error adding new user');
      } else {
        console.log('New user added. Insert ID:', result.insertId);
        res.json({ message: 'Data inserted successfully', success: true });
      }
    });
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('creds', email, password);

  const query = 'SELECT id, username, email, password FROM users WHERE email = ?';

  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ message: 'Server error' });
      return;
    }

    // if (results.length === 0) {
    //   res.json({ message: "Invalid email", success: false, type: "email" });
    //   return;
    // }

    const rows = results as RowDataPacket[];
    if (rows.length === 0) {
      res.status(400).json({ message: 'Invalid email', success: false, type: 'email' });
      return;
    }

    const user = rows[0];
    console.log('user: ', user);
    const passwordMatch = await bcrypt.compare(password, user.password);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in the environment variables');
    }

    if (passwordMatch) {
      const token = jwt.sign({ id: user.id }, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });
      //throw error in else??
      console.log('token', token);

      const cookieExpireTime = Number(process.env.JWT_COOKIE_EXPIRES);
      if (!jwtSecret) {
        throw new Error('JWT_COOKIE_EXPIRES_IN is not set in the environment variables');
      }
      if (isNaN(cookieExpireTime)) {
        throw new Error('JWT_COOKIE_EXPIRES is not set correctly in the environment variables');
      }

      const cookieOptions = {
        expires: new Date(Date.now() + cookieExpireTime * 24 * 60 * 60 * 1000),
        httpOnly: true
      };
      res.cookie('jwt', token, cookieOptions);
      res.json({ message: 'Login successful', success: true, user });
    } else {
      res.json({
        message: 'Invalid password',
        success: false,
        type: 'password'
      });
    }
  });
});

// router.get("/validate", validateToken, async (req: Request, res: Response) => {
//   try {
//     const user = req.user;

//     if (!user) {
//       res
//         .status(401)
//         .json({ validationSuccess: false, message: "Not authorized" });
//       return;
//     }

//     res.status(200).json({
//       validationSuccess: true,
//       message: "Successfully validated user.",
//     });
//   } catch (error) {
//     console.error("Error in /validate route:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

router.get('/logout', (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true
  });
  res.json({ message: 'User logged out' });
});

// module.exports = router;
export default router;
