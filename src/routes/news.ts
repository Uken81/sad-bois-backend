import express, { Response, Request } from 'express';
import { QueryError, RowDataPacket } from 'mysql2';
import { attachConnection } from '../middlewares/attachConnection';
import { checkConnection } from '../Utils/checkConnection';

const router = express.Router();
router.use(attachConnection);

const isEmptyResults = (results: RowDataPacket[]) => {
  if (results.length === 0) {
    return true;
  }

  return false;
};

router.get('/', (req: Request, res: Response) => {
  const connection = checkConnection(req.dbConnection);

  const query = 'SELECT * FROM news ORDER BY date DESC;';
  connection.query(query, (err: QueryError | null, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Datbase error occured',
        details: err.message,
        fatalError: err.fatal
      });
    }

    if (isEmptyResults(results)) {
      return res.status(404).json({
        error: 'No news found'
      });
    }

    res.status(200).json(results);
  });
});

router.get('/latest', (req: Request, res: Response) => {
  const connection = checkConnection(req.dbConnection);

  const query = 'SELECT * FROM news ORDER BY date DESC LIMIT 3;';
  connection.query(query, (err: QueryError, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error executing query: ', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (isEmptyResults(results)) {
      console.error('Error: failed to find news');
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(results);
  });
});

router.get('/byId', (req, res) => {
  const connection = checkConnection(req.dbConnection);

  const id = req.query.id;

  if (!id) {
    return res.status(400).json({
      error: 'No ID provided'
    });
  }

  const query = 'SELECT * FROM news WHERE id = ? LIMIT 1';
  connection.query(query, [id], (err: QueryError | null, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Datbase error occured',
        details: err.message,
        fatalError: err.fatal
      });
    }

    if (isEmptyResults(results)) {
      return res.status(404).json({
        error: 'No article with that id found'
      });
    }

    res.json(results[0]);
  });
});

export default router;
