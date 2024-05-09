import express, { Request, Response } from 'express';
import {
  CardDetailsType,
  validateCardDetails
} from '../../Utils/CardValidation/validateCardDetails';
import { calculateOrderTotal } from './Utils/calculateOrderTotal';
import { CartType, CustomerType, OrderDataType, ShippingType } from '../../Types/checkoutTypes';
import { createOrder } from './Utils/createOrder';
import { checkIfExistingCustomer } from './Utils/checkIfExistingCustomer';
import { insertCustomer } from './Utils/insertCustomer';
import { v4 as uuidv4 } from 'uuid';
import { insertOrder } from './Utils/insertOrder';
import { getUserCredentials } from '../../middlewares/getUserCredentials';

const router = express.Router();

router.post('/', getUserCredentials, async (req: Request, res: Response) => {
  try {
    const userCredentials = req.userCredentials;
    if (!userCredentials) {
      console.error('userCredentials is null or undefined');
      return res
        .status(500)
        .json({ message: 'Internal server error: user credentials processing failed.' });
    }

    const customerDetails: CustomerType = req.body.customer;
    const cardDetails: CardDetailsType = req.body.formValues;
    const cart: CartType = req.body.cart;
    const shippingData: ShippingType = req.body.selectedShipping;
    if (!cardDetails || !customerDetails || !cart || !shippingData) {
      console.error(
        `Missing required query paramater in processing order for ${customerDetails.email}`
      );
      return res.status(400).json({ message: 'Form details error' });
    }

    const validationResults = validateCardDetails(cardDetails);
    if (!validationResults.success) {
      console.error(`Could not validate card for ${customerDetails.email}`);
      return res
        .status(403)
        .json({ type: validationResults.type, message: validationResults.message });
    }

    const isExistingCustomer = await checkIfExistingCustomer(userCredentials);
    const customerId =
      userCredentials?.isLoggedIn && userCredentials.id ? userCredentials.id : uuidv4();
    if (!isExistingCustomer) {
      await insertCustomer(customerDetails, customerId);
    }

    const orderTotalCost = await calculateOrderTotal(cart, shippingData);
    const orderData: OrderDataType = {
      customerId,
      customerDetails,
      cart,
      shippingData,
      orderTotalCost
    };
    const customerOrder = createOrder(orderData);
    await insertOrder(customerOrder);
    return res
      .status(200)
      .json({ message: 'Order processed successfully', orderSummary: customerOrder });
  } catch (error) {
    console.error('Unexpected error processing orders', error);
    return res.status(500).json({
      type: 'network',
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

export default router;
