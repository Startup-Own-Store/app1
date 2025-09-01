const axios = require('axios');

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { amount } = req.body;
  const key_id = 'rzp_test_aSxggwJlgc2fij';
  const key_secret = 'vIsj3FxcoVJeC5Mjqd3LJ2us';
  const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');

  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount: Math.round(amount * 100), // amount in paise
        currency: 'INR',
        receipt: 'receipt#1',
        payment_capture: 1,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
