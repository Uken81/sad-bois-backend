import express, { Request, Response } from 'express';
import { isResultEmpty } from '../Utils/isResultEmpty';
import { pool } from '../server';
import { QueryResultRow } from 'pg';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const email = req.query.email;
  const query = 'SELECT * FROM shop_orders WHERE customerEmail = ? ORDER BY dateOrdered DESC';
  pool?.query(query, [email], (err: Error | null, results: QueryResultRow) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message
      });
    }

    if (isResultEmpty(results)) {
      console.log('Current user has no product orders');
      return res.status(200).json({ message: 'User has not made any orders yet.' });
    }

    res.status(200).json(results);
  });
});

export default router;
