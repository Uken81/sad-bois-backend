import express, { Request, Response } from 'express';
import { QueryError, RowDataPacket } from 'mysql2';
import { isResultEmpty } from '../Utils/isResultEmpty';
import { connection } from '../server';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const email = req.query.email;
  const query = 'SELECT * FROM shop_orders WHERE customerEmail = ? ORDER BY dateOrdered DESC';
  connection?.query(query, [email], (err: QueryError | null, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message,
        fatalError: err.fatal
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
