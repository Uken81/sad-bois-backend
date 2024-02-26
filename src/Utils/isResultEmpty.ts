import { QueryResult } from 'pg';

export const isResultEmpty = (results: QueryResult) => {
  if (!results.rows) {
    console.error('Can not determine length of null or undefined rows.');
    return;
  }

  return results.rows.length === 0;
};
