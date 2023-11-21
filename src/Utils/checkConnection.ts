import { Connection } from 'mysql2';

export const checkConnection = (connectionObj: Connection | null) => {
  if (!connectionObj) {
    throw new Error('Failed to initialise connection');
  }

  return connectionObj;
};
