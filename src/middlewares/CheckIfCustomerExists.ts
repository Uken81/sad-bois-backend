import { Response, Request, NextFunction } from 'express';
import { QueryError, RowDataPacket } from 'mysql2';
import { checkConnection } from '../Utils/checkConnection';
import { isResultEmpty } from '../Utils/isResultEmpty';

export const checkIfCustomerExists = async (req: Request, res: Response, next: NextFunction) => {
  const connection = checkConnection(req.dbConnection);
  const email = req.body.customer?.email;
  if (!email) {
    console.error('Email value must be provided in customer check');
    return res.status(400).json({ error: 'Email required' });
  }

  const query = `SELECT CASE 
                WHEN EXISTS (
                    SELECT 1
                    FROM customers
                    WHERE email = ?
                ) THEN 'true'
                ELSE 'false'
            END as conditionMet;`;

  connection.query(query, [email], (err: QueryError | null, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error executing query: ', err);
      return res.status(500).json({
        error: 'Database error occured',
        details: err.message,
        fatalError: err.fatal
      });
    }

    if (isResultEmpty(results)) {
      return res.status(404).json({
        error: 'Error finding matching customers'
      });
    }

    const row = results[0];
    req.isExistingCustomer = row.conditionMet;
    next();
  });
};
