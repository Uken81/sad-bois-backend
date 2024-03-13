import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export const verifyToken = async (token: string): Promise<DecodedToken> => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not correctly set in the environment variables');
    throw new Error('Internal server error');
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err: Error | null, decoded: unknown) => {
      if (err) {
        console.error('Error verifying token', err);
        reject(new Error(err.message));
      }

      if (!decoded) {
        console.error('Token is null or not decoded properly');
        reject(new Error('Internal server error'));
      }
      resolve(decoded as DecodedToken);
    });
  });
};
