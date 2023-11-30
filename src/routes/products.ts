import express, { Response, Request } from 'express';
import { QueryError, RowDataPacket } from 'mysql2';
import { checkConnection } from '../Utils/checkConnection';
import { attachConnection } from '../middlewares/attachConnection';
import { isResultEmpty } from '../Utils/isResultEmpty';

const router = express.Router();
router.use(attachConnection);

router.get('/', (req: Request, res: Response) => {
  const connection = checkConnection(req.dbConnection);

  const query = 'SELECT * FROM products';
  connection.query(query, (err: QueryError, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message,
        fatalError: err.fatal
      });
    }

    if (isResultEmpty(results)) {
      console.error('Error: failed to find products');
      return res.status(500).json({ error: 'Products not found' });
    }

    res.status(200).json(results);
  });
});

router.get('/featured', (req: Request, res: Response) => {
  const connection = checkConnection(req.dbConnection);

  const query = 'SELECT * FROM products WHERE isFeatured = 1';
  connection.query(query, (err: QueryError, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message,
        fatalError: err.fatal
      });
    }

    if (isResultEmpty(results)) {
      console.error('Error: failed to find featured products');
      return res.status(500).json({ error: 'Featured products not found' });
    }

    res.status(200).json(results);
  });
});

router.get('/byId', (req: Request, res: Response) => {
  const connection = checkConnection(req.dbConnection);

  const id = req.query.id;
  console.log('id**: ', id);

  const query = 'SELECT * FROM products WHERE id = ? LIMIT 1';
  connection.query(query, [id], (err: QueryError | null, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message,
        fatalError: err.fatal
      });
    }

    if (isResultEmpty(results)) {
      console.error('Error: failed to find selected product');
      return res.status(500).json({ error: 'No product with that id found' });
    }

    res.status(200).json(results[0]);
  });
});

export default router;
