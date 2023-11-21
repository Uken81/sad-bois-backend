import express, { Response, Request } from 'express';
import { QueryError, RowDataPacket } from 'mysql2';
import connection from '../server';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const query = 'SELECT * FROM tour ORDER BY date DESC;';
  if (!connection) {
    console.log('connection error', connection);
    return;
  }
  connection.query(query, (err: QueryError | null, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Database error');
    } else {
      res.json(results);
    }
  });
});

router.get('/latest', (req: Request, res: Response) => {
  const query = 'SELECT * FROM tour ORDER BY date DESC LIMIT 4;';
  if (!connection) {
    console.log('connection error', connection);
    return;
  }
  connection.query(query, (err: QueryError, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Database error');
    } else {
      res.json(results);
    }
  });
});

export default router;
