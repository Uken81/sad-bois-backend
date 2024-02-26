import express, { Response, Request } from 'express';
import { isResultEmpty } from '../Utils/isResultEmpty';
import { pool } from '../server';
import { QueryResult } from 'pg';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM news ORDER BY date DESC;';
    pool?.query(query, (err: Error | null, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({
          message: 'Server error'
        });
      }

      res.status(200).json(results.rows);
    });
  } catch (error) {
    console.error('Unexpected error fetching news: ', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

router.get('/latest', (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM news ORDER BY date DESC LIMIT 3;';
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
    console.error('Unexpected error fetching news: ', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

router.get('/byId', (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({
        error: 'No article ID provided'
      });
    }

    const query = 'SELECT * FROM news WHERE id = $1 LIMIT 1';
    pool?.query(query, [id], (err: Error | null, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({
          message: 'Server error'
        });
      }

      if (isResultEmpty(results)) {
        return res.status(404).json({
          message: 'No article with that id found'
        });
      }

      res.status(200).json(results.rows[0]);
    });
  } catch (error) {
    console.error('Unexpected error fetching news: ', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

export default router;
