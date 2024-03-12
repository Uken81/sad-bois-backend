import { QueryResult } from 'pg';
import { pool } from '../server';

export const checkIfRegistered = (email: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const duplicteQuery = 'SELECT email FROM users WHERE email = $1';
    pool?.query(duplicteQuery, [email], (err: Error | null, results: QueryResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        reject(new Error(`Error querying the database`));
      } else {
        const isRegistered = results.rows.length > 0;
        resolve(isRegistered);
      }
    });
  });
};
