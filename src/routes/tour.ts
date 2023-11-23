import express, { Response, Request } from 'express';
import { QueryError, RowDataPacket } from 'mysql2';
import { checkConnection } from '../Utils/checkConnection';
import { attachConnection } from '../middlewares/attachConnection';
import { isResultEmpty } from '../Utils/isResultEmpty';

const router = express.Router();
router.use(attachConnection);

router.get('/', (req: Request, res: Response) => {
  const connection = checkConnection(req.dbConnection);

  const query = 'SELECT * FROM tour ORDER BY date DESC;';
  connection.query(query, (err: QueryError | null, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message,
        fatalError: err.fatal
      });
    }

    if (isResultEmpty(results)) {
      return res.status(404).json({
        error: 'No tours found'
      });
    }

    res.status(200).json(results);
  });
});

router.get('/latest', (req: Request, res: Response) => {
  const connection = checkConnection(req.dbConnection);

  const query = 'SELECT * FROM tour ORDER BY date DESC LIMIT 4;';
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
      console.error('Error: failed to find tour');
      return res.status(404).json({ error: 'Latest tours not found' });
    }

    res.status(200).json(results);
  });
});

export default router;
