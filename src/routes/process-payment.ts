import express, { Request, Response } from 'express';
import { attachConnection } from '../middlewares/attachConnection';
import { validateCardDetails } from '../Utils/CardValidation/validateCardDetails';
import { checkConnection } from '../Utils/checkConnection';
import { QueryError } from 'mysql2';

const router = express.Router();
router.use(attachConnection);

router.post('/', (req: Request, res: Response) => {
  console.log('test', req.body.customer);
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

  if (isCardValid) {
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

    const query =
      'INSERT INTO customers (email, emailoffers, country, firstname, lastname, address, apartment, suburb, state, postcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    connection.query(
      query,
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
      (err: QueryError | null) => {
        if (err) {
          return res.status(500).json({
            error: 'Database error occured',
            type: 'network',
            details: err.message,
            fatalError: err.fatal
          });
        }

        console.log(`New User ${email} added`);
      }
    );
    return res.status(200).json({ message: 'Payment processed successfully' });
  } else {
    return res.status(400).json({ message: 'Invalid payment details' });
  }
});

export default router;
