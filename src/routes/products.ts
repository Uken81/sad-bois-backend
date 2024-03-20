import express, { Response, Request } from 'express';
import { isResultEmpty } from '../Utils/isResultEmpty';
import { pool } from '../server';
import { QueryResult } from 'pg';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const category = req.query.category;
    const categorySelected = category && category !== 'undefined' && category !== 'all';
    let query = "SELECT * FROM products WHERE category <> 'concert'";

    const params = [];
    if (categorySelected) {
      query += 'AND category = $1';
      params.push(category);
    }

    query += ' ORDER BY id ASC;';

    pool?.query(query, params, (err: Error, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({
          message: 'Server error'
        });
      }

      if (isResultEmpty(results)) {
        console.log(`No products found with query: ${query}`);
      }

      res.status(200).json(results.rows);
    });
  } catch (error) {
    console.error('Unexpected error fetching products: ', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

router.get('/featured', (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM products WHERE is_Featured = true';
    pool?.query(query, (err: Error, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({
          message: 'Server error'
        });
      }

      if (isResultEmpty(results)) {
        console.log('No featured products found');
      }

      res.status(200).json(results.rows);
    });
  } catch (error) {
    console.error('Unexpected error fetching featured products: ', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

router.get('/byId', (req: Request, res: Response) => {
  try {
    const id = req.query.id;
    const query = 'SELECT * FROM products WHERE id = $1 LIMIT 1';
    pool?.query(query, [id], (err: Error | null, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({
          message: 'Server error'
        });
      }

      if (isResultEmpty(results)) {
        console.error(`failed to find product with ID of ${id}`);
        return res.status(500).json({ message: 'No product with that id found' });
      }

      res.status(200).json(results.rows[0]);
    });
  } catch (error) {
    console.error('Unexpected error fetching product', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

export default router;
