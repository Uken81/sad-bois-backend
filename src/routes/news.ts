import express, { Response, Request } from 'express';
import { isResultEmpty } from '../Utils/isResultEmpty';
import { pool } from '../server';
import { QueryResult } from 'pg';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const query = 'SELECT * FROM news ORDER BY date DESC;';
  pool?.query(query, (err: Error | null, results: QueryResult) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message
      });
    }

    if (isResultEmpty(results.rows)) {
      return res.status(404).json({
        error: 'No news found'
      });
    }

    res.status(200).json(results.rows);
  });
});

router.get('/latest', (req: Request, res: Response) => {
  const query = 'SELECT * FROM news ORDER BY date DESC LIMIT 3;';
  pool?.query(query, (err: Error, results: QueryResult) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message
      });
    }

    if (isResultEmpty(results.rows)) {
      console.error('Error: failed to find news');
      return res.status(404).json({ error: 'Latest news not found' });
    }
    //add error if array !==3??
    res.status(200).json(results.rows);
  });
});

router.get('/byId', (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({
      error: 'No ID provided'
    });
  }

  const query = 'SELECT * FROM news WHERE id = $1 LIMIT 1';
  pool?.query(query, [id], (err: Error | null, results: QueryResult) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message
      });
    }

    if (isResultEmpty(results.rows)) {
      return res.status(404).json({
        error: 'No article with that id found'
      });
    }

    res.status(200).json(results.rows);
  });
});

export default router;
