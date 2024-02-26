import express, { Request, Response } from 'express';
import { pool } from '../server';
import { QueryResult } from 'pg';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const email = req.query.email;
    if (!email) {
      res.status(400).json({
        message: 'Missing required query parameter: email'
      });
    }

    const query = 'SELECT * FROM orders WHERE customer_email = $1 ORDER BY date_ordered DESC';
    pool?.query(query, [email], (err: Error | null, results: QueryResult) => {
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
