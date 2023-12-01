import express, { Request, Response } from 'express';
import { attachConnection } from '../middlewares/attachConnection';
import { validateCreditCardNumber } from '../Utils/CardValidation/validateCreditCardNumber';
import { validateExpirationDate } from '../Utils/CardValidation/validateExpirationDate';
import { validateSecurityCode } from '../Utils/CardValidation/validateSecurityCode';
import { validateNameOnCard } from '../Utils/CardValidation/validateNameOnCard';

const router = express.Router();
router.use(attachConnection);

router.post('/', (req: Request, res: Response) => {
  console.log('test');
  const { cardNumber, nameOnCard, expirationDate, securityCode } = req.body;

  let isCardValid = false;

  if (!cardNumber || !nameOnCard || !expirationDate || !securityCode) {
    return res.status(400).json({ success: false, message: 'Missing form data' });
  }

  if (!validateCreditCardNumber(cardNumber)) {
    return res.status(400).json({ type: 'cardNumber', message: 'Invalid card number' });
  }
  if (!validateExpirationDate(expirationDate)) {
    return res.status(400).json({ type: 'cardExpiration', message: 'Invalid expiration date' });
  }
  if (!validateSecurityCode(securityCode)) {
    return res.status(400).json({ type: 'cardSecurityCode', message: 'Invalid security code' });
  }
  if (!validateNameOnCard(nameOnCard)) {
    return res.status(400).json({ type: 'nameOnCard', message: 'Invalid name on card' });
  }

  isCardValid = true;

  if (isCardValid) {
    return res.status(200).json({ success: true, message: 'Payment processed successfully' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid payment details' });
  }
});

export default router;
