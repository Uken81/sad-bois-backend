import { CustomerType } from '../../../Types/checkoutTypes';
import { pool } from '../../../server';

export const insertCustomer = async (customer: CustomerType, customerId: string | null) => {
  console.log('CID', customerId);
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

  if (!customerId) {
    throw new Error(`Error creating new customer id for ${email}`);
  }

  const customerInsertionQuery =
    'INSERT INTO customers (id, email, email_offers, country, first_name, last_name, address, apartment, suburb, state, postcode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';

  pool?.query(
    customerInsertionQuery,
    [
      customerId,
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
        throw new Error(`Error querying the database: ${err}`);
      }

      console.log(`New customer ${email} added`);
    }
  );
};
