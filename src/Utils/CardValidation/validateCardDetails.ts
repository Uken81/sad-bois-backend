import { validateCreditCardNumber } from './validateCreditCardNumber';
import { validateExpirationDate } from './validateExpirationDate';
import { validateNameOnCard } from './validateNameOnCard';
import { validateSecurityCode } from './validateSecurityCode';

export interface CardDetailsType {
  cardNumber: string;
  nameOnCard: string;
  expirationDate: string;
  securityCode: string;
}
export const validateCardDetails = (cardDetails: CardDetailsType) => {
  const { cardNumber, nameOnCard, expirationDate, securityCode } = cardDetails;

  if (!cardNumber || !nameOnCard || !expirationDate || !securityCode) {
    return { success: false, message: 'Missing form data' };
  }

  if (!validateCreditCardNumber(cardNumber)) {
    return { success: false, type: 'cardNumber', message: 'Invalid card number' };
  }
  if (!validateExpirationDate(expirationDate)) {
    return { success: false, type: 'cardExpiration', message: 'Invalid expiration date' };
  }
  if (!validateSecurityCode(securityCode)) {
    return { success: false, type: 'cardSecurityCode', message: 'Invalid security code' };
  }
  if (!validateNameOnCard(nameOnCard)) {
    return { success: false, type: 'nameOnCard', message: 'Invalid name on card' };
  }

  return { success: true };
};
