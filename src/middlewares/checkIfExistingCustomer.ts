import { Response, Request, NextFunction } from 'express';
import { isResultEmpty } from '../Utils/isResultEmpty';
import { pool } from '../server';
import { QueryResult } from 'pg';
import { verifyToken } from '../Utils/verifyToken';

export const checkIfExistingCustomer = async (req: Request, res: Response, next: NextFunction) => {
  //change name to getExistingCustomerId??

  //create utility (getUserId, checkIfUserLoggedIn) use as middleware??
  //either return id or object with isLoggedin and id.
  //move query to own function checkIfExistingCustomer
  console.log('IEC check');
  const cookie = req.cookies.jwt;
  //create isLoggedIn utility??
  const isLoggedIn = cookie ? true : false;
  console.log('jwt', cookie);
  //try catch??
  if (!isLoggedIn) {
    req.isExistingCustomer = false;
    next();
  }
  const decoded = await verifyToken(cookie);
  console.log('decoded', decoded.userId);
  const userId = decoded.userId;

  // const email = req.body.customer?.email;
  // if (!email) {
  //   console.error('Email value must be provided in customer check');
  //   return res.status(400).json({ error: 'Email required' });
  // }

  const query = 'SELECT EXISTS (SELECT 1 FROM customers WHERE id = $1) AS conditionMet;';

  pool?.query(query, [userId], (err: Error | null, results: QueryResult) => {
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
    const conditionMet = row.conditionmet;
    if (row.conditionmet === undefined || typeof conditionMet !== 'boolean') {
      console.error('Incorrect value returned from query');
      return res.status(500).json({
        message: 'Server error',
        type: 'server'
      });
    }

    // const IEC = {
    //   isUser: ,
    //   userId
    // }
    req.isExistingCustomer = conditionMet;
    console.log('condition met: ', conditionMet);
    next();
  });
};
