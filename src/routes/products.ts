import express, { Response, Request } from 'express';
import { isResultEmpty } from '../Utils/isResultEmpty';
import { pool } from '../server';
import { QueryResult } from 'pg';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const category = req.query.category;
  let query = 'SELECT * FROM products';
  const params = [];

  if (category && category !== 'undefined' && category !== 'all') {
    query += ' WHERE category = $1';
    params.push(category);
  }

  query += ' ORDER BY id ASC;';

  pool?.query(query, params, (err: Error, results: QueryResult) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message
      });
    }

    if (isResultEmpty(results.rows)) {
      console.log(`No products found with query: ${query}`);
    }

    res.status(200).json(results.rows);
  });
});

router.get('/featured', (req: Request, res: Response) => {
  const query = 'SELECT * FROM products WHERE is_Featured = true';
  pool?.query(query, (err: Error, results: QueryResult) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message
      });
    }

    if (isResultEmpty(results.rows)) {
      console.log('No featured products found');
    }

    res.status(200).json(results.rows);
  });
});

router.get('/byId', (req: Request, res: Response) => {
  const id = req.query.id;
  const query = 'SELECT * FROM products WHERE id = $1 LIMIT 1';
  pool?.query(query, [id], (err: Error | null, results: QueryResult) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message
      });
    }

    if (isResultEmpty(results.rows)) {
      console.error('Error: failed to find selected product');
      return res.status(500).json({ error: 'No product with that id found' });
    }

    res.status(200).json(results.rows[0]);
  });
});

export default router;
