import express, { Response, Request } from 'express';
import { pool } from '../server';
import { QueryResult } from 'pg';
import { isResultEmpty } from '../Utils/isResultEmpty';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM tour ORDER BY date DESC;';
    pool?.query(query, (err: Error | null, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({
          message: 'Server error'
        });
      }

      if (isResultEmpty(results)) {
        return res.status(404).json({
          message: 'No shows found'
        });
      }

      res.status(200).json(results.rows);
    });
  } catch (error) {
    console.error('Unexpected error fetching tour: ', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

router.get('/latest', (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM tour ORDER BY date DESC LIMIT 4;';
    pool?.query(query, (err: Error, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({
          message: 'Server error'
        });
      }

      res.status(200).json(results.rows);
    });
  } catch (error) {
    console.error('Unexpected error fetching latest tour: ', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

router.get('/byId', (req: Request, res: Response) => {
  try {
    const id = req.query.id;

    const query = 'SELECT * FROM tour WHERE id = $1';
    pool.query(query, [id], (err: Error, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database');
        return res.status(500).json({ message: 'Server Error' });
      }

      if (isResultEmpty(results)) {
        return res.status(500).json({ message: 'Error querying the database' });
      }

      res.status(200).json(results.rows[0]);
    });
  } catch (error) {
    console.error('Unexpected error fetching latest show: ', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

export default router;
