import express, { Response, Request } from 'express';
import { QueryError, RowDataPacket } from 'mysql2';
import { checkConnection } from '../Utils/checkConnection';
import { attachConnection } from '../middlewares/attachConnection';

const router = express.Router();
router.use(attachConnection);

router.get('/', (req: Request, res: Response) => {
  const connection = checkConnection(req.dbConnection);

  const query = 'SELECT * FROM tour ORDER BY date DESC;';
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
  const connection = checkConnection(req.dbConnection);

  const query = 'SELECT * FROM tour ORDER BY date DESC LIMIT 4;';
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
