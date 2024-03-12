import express, { Request, Response } from 'express';
import {
  CardDetailsType,
  validateCardDetails
} from '../../Utils/CardValidation/validateCardDetails';
import { calculateOrderTotal } from './calculateOrderTotal';
import {
  CartType,
  CustomerType,
  OrderDataType,
  ShippingType,
  TotalCalculationDataType
} from '../../Types/checkoutTypes';
import { createOrder } from './createOrder';
import { checkIfExistingCustomer } from '../../middlewares/checkIfExistingCustomer';
import { pool } from '../../server';
import { insertCustomer } from './insertCustomer';
import { v4 as uuidv4 } from 'uuid';

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
      insertCustomer(customer, newCustomerId);
    }

    const totalsCalculationData: TotalCalculationDataType = {
      cart,
      shippingData
    };

    const orderTotal = await calculateOrderTotal(totalsCalculationData);

    const orderData: OrderDataType = {
      customer,
      cart,
      shippingData
    };

    const customerOrder = createOrder(orderData, orderTotal);
    const {
      orderId,
      customerEmail,
      shippingDetails,
      orderedProducts,
      dateOrdered,
      shippingType,
      totalCost
    } = customerOrder;
    const customerOrderQuery =
      'INSERT INTO orders (order_id, customer_email, shipping_Details, ordered_products, date_ordered, shipping_type, total_cost) VALUES ($1, $2, $3, $4, $5, $6, $7)';

    pool?.query(
      customerOrderQuery,
      [
        orderId,
        customerEmail,
        shippingDetails,
        orderedProducts,
        dateOrdered,
        shippingType,
        totalCost
      ],
      (err: Error | null) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: 'Database error occured',
            type: 'network',
            details: err.message
          });
        }

        console.log(`New order added for ${customerEmail}`);
      }
    );

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
