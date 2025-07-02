const validateZellePayment = (data) => {
  const { confirmationId, amount, orderId } = data;
  
  // Validate required fields
  if (!confirmationId || !amount || !orderId) {
    return 'All fields are required';
  }
  
  // Validate confirmation ID format
  if (typeof confirmationId !== 'string' || !/^[A-Z0-9]{9,10}$/.test(confirmationId)) {
    return 'Invalid transaction ID format. Must be 9-10 uppercase alphanumeric characters';
  }
  
  // Validate amount
  if (typeof amount !== 'number' || amount <= 0) {
    return 'Invalid payment amount';
  }
  
  // Validate order ID
  if (typeof orderId !== 'string' || orderId.length < 5) {
    return 'Invalid order ID';
  }
  
  return null; // No errors
};

module.exports = {
  validateZellePayment
};