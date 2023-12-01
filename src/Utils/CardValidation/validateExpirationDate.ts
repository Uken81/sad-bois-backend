export const validateExpirationDate = (date: string) => {
  const regex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
  if (!regex.test(date)) return false;

  const currentDate = new Date();
  const month = parseInt(date.substring(0, 2), 10) - 1; // -1 because months are 0-indexed
  const year = parseInt(date.length === 7 ? date.substring(3) : `20${date.substring(3)}`, 10);
  const expirationDate = new Date(year, month + 1, 0); // Last day of the expiration month

  return expirationDate > currentDate;
};
