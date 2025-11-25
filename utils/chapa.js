const axios = require('axios');

const CHAPA_URL = 'https://api.chapa.co/v1/transaction';

const chapa = axios.create({
  baseURL: CHAPA_URL,
  headers: {
    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Initialize transaction
const initializeTransaction = async (transactionData) => {
  try {
    const response = await chapa.post('/initialize', transactionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Payment initialization failed');
  }
};

// Verify transaction
const verifyTransaction = async (transactionId) => {
  try {
    const response = await chapa.get(`/verify/${transactionId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Transaction verification failed');
  }
};

module.exports = {
  initializeTransaction,
  verifyTransaction
};