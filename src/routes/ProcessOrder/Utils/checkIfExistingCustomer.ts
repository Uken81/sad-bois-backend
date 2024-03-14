import { pool } from '../../../server';
import { QueryResult } from 'pg';
import { UserCredentials } from '../../../middlewares/getUserCredentials';

export const checkIfExistingCustomer = async (
  userCredentials: UserCredentials
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!userCredentials.isLoggedIn) {
      resolve(false);
    }

    const query = 'SELECT EXISTS (SELECT 1 FROM customers WHERE id = $1) AS conditionMet;';

    pool?.query(query, [userCredentials.id], (err: Error | null, results: QueryResult) => {
      if (err) {
        return reject(new Error(`Error executing query: ${err}`));
      }

      const row = results.rows[0];
      const conditionMet: boolean = row.conditionmet;
      if (row.conditionmet === undefined || typeof conditionMet !== 'boolean') {
        return reject(new Error('Incorrect value returned from query'));
      }

      resolve(conditionMet);
    });
  });
};
