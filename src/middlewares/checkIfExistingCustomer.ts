import { Response, Request, NextFunction } from 'express';
import { isResultEmpty } from '../Utils/isResultEmpty';
import { pool } from '../server';
import { QueryResult } from 'pg';

export const checkIfExistingCustomer = async (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.customer?.email;
  console.log('em,al', email);
  if (!email) {
    console.error('Email value must be provided in customer check');
    return res.status(400).json({ error: 'Email required' });
  }

  const query = 'SELECT EXISTS (SELECT 1 FROM customers WHERE email = $1) AS conditionMet;';

  pool?.query(query, [email], (err: Error | null, results: QueryResult) => {
    if (err) {
      console.error('Error executing query: ', err);
      return res.status(500).json({
        error: 'Database error occured',
        details: err.message
      });
    }

    if (isResultEmpty(results)) {
      return res.status(404).json({
        error: 'Error finding matching customers'
      });
    }

    const row = results.rows[0];
    console.log('rowcon', row.conditionmet);
    // if (row.conditionmet === undefined || typeof row.conditionMet !== 'boolean') {
    //   console.error('Incorrect value returned from query');
    //   return res.status(500).json({
    //     message: 'Server error',
    //     type: 'server'
    //   });
    // }

    req.isExistingCustomer = row.conditionmet;
    next();
  });
};
