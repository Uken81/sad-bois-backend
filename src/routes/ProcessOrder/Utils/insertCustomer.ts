import { CustomerType } from '../../../Types/checkoutTypes';
import { pool } from '../../../server';

export const insertCustomer = async (customer: CustomerType, customerId: string | null) => {
  if (!customerId || !customer) {
    throw new Error('Error creating new customer');
  }

  try {
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

    const customerInsertionQuery =
      'INSERT INTO customers (id, email, email_offers, country, first_name, last_name, address, apartment, suburb, state, postcode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
    await pool?.query(customerInsertionQuery, [
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
    ]);

    console.log(`New customer ${customerId} added`);
  } catch (error) {
    throw new Error(`Error inserting customer ${customerId}: ${error}`);
  }
};
