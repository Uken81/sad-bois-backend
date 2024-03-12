import express, { Request, Response } from 'express';
import {
  CardDetailsType,
  validateCardDetails
} from '../../Utils/CardValidation/validateCardDetails';
import { calculateOrderTotal } from './Utils/calculateOrderTotal';
import { CartType, CustomerType, OrderDataType, ShippingType } from '../../Types/checkoutTypes';
import { createOrder } from './Utils/createOrder';
import { checkIfExistingCustomer } from '../../middlewares/checkIfExistingCustomer';
import { insertCustomer } from './Utils/insertCustomer';
import { v4 as uuidv4 } from 'uuid';
import { insertOrder } from './Utils/insertOrder';

const router = express.Router();

router.post('/', checkIfExistingCustomer, async (req: Request, res: Response) => {
  console.log('Cookies: ', req.cookies);

  try {
    const cardDetails: CardDetailsType = req.body.formValues;
    const customer: CustomerType = req.body.customer;
    const cart: CartType = req.body.cart;
    const shippingData: ShippingType = req.body.selectedShipping;

    if (!cardDetails || !customer || !cart || !shippingData) {
      console.error(`Missing required query paramater in processing order for ${customer.email}`);
      return res.status(400).json({ message: 'Form details error' });
    }

    const validationResults = validateCardDetails(cardDetails);
    if (!validationResults.success) {
      console.error(`Could not validate card for ${customer.email}`);
      return res
        .status(403)
        .json({ type: validationResults.type, message: validationResults.message });
    }

    const isExistingCustomer: boolean | undefined = req.isExistingCustomer;
    console.log('isEC', isExistingCustomer);

    const newCustomerId = !isExistingCustomer ? uuidv4() : null;
    if (!isExistingCustomer) {
      //test errors
      await insertCustomer(customer, newCustomerId);
    }

    const orderTotal = await calculateOrderTotal(cart, shippingData);

    const orderData: OrderDataType = {
      customer,
      cart,
      shippingData
    };
    const customerOrder = createOrder(orderData, orderTotal);

    //test errors
    await insertOrder(customerOrder);

    return res
      .status(200)
      .json({ message: 'Order processed successfully', orderSummary: customerOrder });
  } catch (error) {
    console.error('Unexpected error processing orders', error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.'
    });
  }
});

export default router;
