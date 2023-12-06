import { RowDataPacket } from 'mysql2';

export const isResultEmpty = (results: RowDataPacket[]) => {
  if (!results) {
    console.error('Can not determine length of empty results.');
    return;
  }

  if (results.length === 0) {
    return true;
  }

  return false;
};
