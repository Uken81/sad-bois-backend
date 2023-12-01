export const validateSecurityCode = (code: string) => {
  const regex = /^[0-9]{3,4}$/;
  return regex.test(code);
};
