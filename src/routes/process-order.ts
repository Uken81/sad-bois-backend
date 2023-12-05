import express, { Request, Response } from 'express';
import { attachConnection } from '../middlewares/attachConnection';
import { validateCardDetails } from '../Utils/CardValidation/validateCardDetails';
import { checkConnection } from '../Utils/checkConnection';
import { QueryError } from 'mysql2';
import { calculateOrderTotal } from '../Utils/calculateOrderTotal';
import { OrderDataType, TotalCalculationDataType } from '../Types/checkoutTypes';
import { createOrder } from '../Utils/createOrder';

const router = express.Router();
router.use(attachConnection);

router.post('/', (req: Request, res: Response) => {
  console.log('test', req.body);
  const connection = checkConnection(req.dbConnection);
  const cardDetails = req.body.formValues;
  let isCardValid = false;

  const validationResults = validateCardDetails(cardDetails);
  if (!validationResults.success) {
    return res
      .status(400)
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
  } = req.body.customer;

  const customerQuery =
    'INSERT INTO customers (email, emailoffers, country, firstname, lastname, address, apartment, suburb, state, postcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  connection.query(
    customerQuery,
    [email, emailoffers, country, firstname, lastname, address, apartment, suburb, state, postcode],
    async (err: QueryError | null) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: 'Database error occured',
          type: 'network',
          details: err.message,
          fatalError: err.fatal
        });
      }
      console.log(`New User ${email} added`);

      const orderCalculationData: TotalCalculationDataType = {
        cart: req.body.cart,
        shippingData: req.body.selectedShipping
      };
      const orderTotal = await calculateOrderTotal(orderCalculationData, connection);

      const orderData: OrderDataType = {
        customerData: req.body.customer,
        cart: req.body.cart,
        shippingData: req.body.selectedShipping
      };

      const customerOrder = createOrder(orderData, orderTotal);
      console.log('orderTotal with shipping', orderTotal);
      console.log('customerOrder', customerOrder);
      const {
        customerEmail,
        shippingDetails,
        orderedProducts,
        dateOrdered,
        shippingType,
        totalCost
      } = customerOrder;
      const customerOrderQuery =
        'INSERT INTO customer_order (customerEmail, shippingDetails, orderedProducts, dateOrdered, shippingType, totalCost) VALUES (?, ?, ?, ?, ?, ?)';

      connection.query(
        customerOrderQuery,
        [customerEmail, shippingDetails, orderedProducts, dateOrdered, shippingType, totalCost],
        (err: QueryError | null) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              error: 'Database error occured',
              type: 'network',
              details: err.message,
              fatalError: err.fatal
            });
          }

          console.log(`New order added for ${customerEmail}`);
        }
      );

      return res
        .status(200)
        .json({ message: 'Order processed successfully', orderSummary: customerOrder });
    }
  );
});

export default router;
