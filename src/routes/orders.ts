import express, { Request, Response } from 'express';
import { pool } from '../server';
import { QueryResult } from 'pg';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const email = req.query.email;
  const query = 'SELECT * FROM orders WHERE customer_email = $1 ORDER BY date_ordered DESC';
  pool?.query(query, [email], (err: Error | null, results: QueryResult) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message
      });
    }

    res.status(200).json(results.rows);
  });
});

export default router;
