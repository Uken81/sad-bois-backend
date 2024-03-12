import { CustomerType } from '../../../Types/checkoutTypes';
import { pool } from '../../../server';

export const insertCustomer = async (customer: CustomerType, newCustomerId: string | null) => {
  const {
    email,
    emailOffers,
    country,
    firstName,
    lastName,
    address,
    apartment,
    suburb,
    state,
    postcode
  } = customer;

  if (!newCustomerId) {
    console.log(`Error creating new customer id for ${email}`);
    throw new Error();
  }

  const customerInsertionQuery =
    'INSERT INTO customers (id, email, email_offers, country, first_name, last_name, address, apartment, suburb, state, postcode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';

  pool?.query(
    customerInsertionQuery,
    [
      newCustomerId,
      email,
      emailOffers,
      country,
      firstName,
      lastName,
      address,
      apartment,
      suburb,
      state,
      postcode
    ],
    async (err: Error | null) => {
      if (err) {
        console.error('Error querying the database:', err);
        //test below
        throw new Error(`${err}`);
        // return res.status(500).json({
        //   message: 'Server error',
        //   type: 'network'
        // });
      }

      console.log(`New customer ${email} added`);
    }
  );
};
