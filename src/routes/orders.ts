import express, { Request, Response } from 'express';
import { attachConnection } from '../middlewares/attachConnection';
import { QueryError, RowDataPacket } from 'mysql2';
import { checkConnection } from '../Utils/checkConnection';
import { isResultEmpty } from '../Utils/isResultEmpty';

const router = express.Router();
router.use(attachConnection);

router.get('/', (req: Request, res: Response) => {
  const connection = checkConnection(req.dbConnection);

  const email = req.query.email;
  const query = 'SELECT * FROM shop_orders WHERE customerEmail = ? ORDER BY dateOrdered DESC';
  connection.query(query, [email], (err: QueryError | null, results: RowDataPacket[]) => {
    console.log('ordersresults', results);
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({
        error: 'Database error occured',
        details: err.message,
        fatalError: err.fatal
      });
    }

    if (isResultEmpty(results)) {
      console.log('Current user has no product orders');
      return res.status(200).json({ message: 'User has not made any orders yet.' });
    }

    res.status(200).json(results);
  });
});

export default router;
