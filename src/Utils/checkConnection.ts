import { Connection } from 'mysql2';

export const checkConnection = (connectionObj: Connection | null) => {
  console.log('*****checking connection*****');

  if (!connectionObj) {
    console.error('Failed to initialise connection');
    throw new Error('Failed to initialise connection');
  }

  return connectionObj;
};
