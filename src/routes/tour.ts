import express, { Response, Request } from 'express';
import { pool } from '../server';
import { QueryResultRow } from 'pg';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const query = 'SELECT * FROM tour ORDER BY date DESC;';
  pool?.query(query, (err: Error | null, results: QueryResultRow) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message
      });
    }

    res.status(200).json(results);
  });
});

router.get('/latest', (req: Request, res: Response) => {
  const query = 'SELECT * FROM tour ORDER BY date DESC LIMIT 4;';
  pool?.query(query, (err: Error, results: QueryResultRow) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message
      });
    }

    res.status(200).json(results);
  });
});

export default router;
