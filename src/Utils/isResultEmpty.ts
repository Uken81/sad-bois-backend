import { RowDataPacket } from 'mysql2';

export const isResultEmpty = (results: RowDataPacket[]) => {
  if (results.length === 0) {
    return true;
  }

  return false;
};
