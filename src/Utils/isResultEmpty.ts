import { QueryResultRow } from 'pg';

export const isResultEmpty = (results: QueryResultRow) => {
  if (!results) {
    console.error('Can not determine length of empty results.');
    return;
  }

  if (results.length === 0) {
    return true;
  }

  return false;
};
