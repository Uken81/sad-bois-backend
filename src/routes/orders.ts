import express, { Request, Response } from 'express';
import { pool } from '../server';
import { QueryResult } from 'pg';
import { getUserCredentials } from '../middlewares/getUserCredentials';

const router = express.Router();

router.get('/', getUserCredentials, (req: Request, res: Response) => {
  try {
    const userCredentials = req.userCredentials;
    if (!userCredentials) {
      console.error('userCredentials is null or undefined');
      return res
        .status(500)
        .json({ message: 'Internal server error: user credentials processing failed.' });
    }

    const query = 'SELECT * FROM orders WHERE customer_id = $1 ORDER BY date_ordered DESC';
    pool?.query(query, [userCredentials.id], (err: Error | null, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({
          message: 'Server error'
        });
      }

      res.status(200).json(results.rows);
    });
  } catch (error) {
    console.error('Unexpected error fetching orders', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

export default router;
