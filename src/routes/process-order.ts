import express, { Request, Response } from 'express';
import { validateCardDetails } from '../Utils/CardValidation/validateCardDetails';
import { calculateOrderTotal } from '../Utils/calculateOrderTotal';
import { OrderDataType, TotalCalculationDataType } from '../Types/checkoutTypes';
import { createOrder } from '../Utils/createOrder';
import { checkIfExistingCustomer } from '../middlewares/checkIfExistingCustomer';
import { pool } from '../server';

const router = express.Router();

router.post('/', checkIfExistingCustomer, async (req: Request, res: Response) => {
  const cardDetails = req.body.formValues;
  const customer = req.body.customer;
  const cart = req.body.cart;
  const shippingData = req.body.selectedShipping;

  if (!cardDetails || !customer || !cart || !shippingData) {
    return res
      .status(400)
      .json({ error: 'Invalid request', message: 'Required data missing in request' });
  }

  let isCardValid = false;
  const validationResults = validateCardDetails(cardDetails);
  if (!validationResults.success) {
    return res
      .status(403)
      .json({ type: validationResults.type, message: validationResults.message });
  } else {
    isCardValid = true;
  }

  if (!isCardValid) {
    return res.status(400).json({ message: 'Invalid payment details' });
  }

  const {
    email,
    emailoffers,
    country,
    firstname,
    lastname,
    address,
    apartment,
    suburb,
    state,
    postcode
  } = customer;

  const customerQuery =
    'INSERT INTO customers (email, emailoffers, country, firstname, lastname, address, apartment, suburb, state, postcode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
  const isExistingCustomer: boolean | undefined = req.isExistingCustomer;
  if (isExistingCustomer === undefined) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error checking for existing customer'
    });
  }

  if (!isExistingCustomer) {
    pool?.query(
      customerQuery,
      [
        email,
        emailoffers,
        country,
        firstname,
        lastname,
        address,
        apartment,
        suburb,
        state,
        postcode
      ],
      async (err: Error | null) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            error: 'Database error occured',
            type: 'network',
            details: err.message
          });
        }

        console.log(`New customer ${email} added`);
      }
    );
  }

  const totalCalculationData: TotalCalculationDataType = {
    cart,
    shippingData
  };

  const orderTotal = await calculateOrderTotal(totalCalculationData);

  const orderData: OrderDataType = {
    customer,
    cart,
    shippingData
  };

  const customerOrder = createOrder(orderData, orderTotal);
  console.log('orderTotal with shipping', orderTotal);
  console.log('customerOrder', customerOrder);
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
    'INSERT INTO shop_orders (orderId, customerEmail, shippingDetails, orderedProducts, dateOrdered, shippingType, totalCost) VALUES ($1, $2, $3, $4, $5, $6, $7)';

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
          error: 'Database error occured',
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
});

export default router;
