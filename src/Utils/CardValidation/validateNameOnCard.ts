export const validateNameOnCard = (name: string) => {
  const regex = /^[a-zA-Z\s]+$/;
  return regex.test(name) && name.trim().length > 0;
};
