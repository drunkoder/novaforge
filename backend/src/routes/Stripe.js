import cors from 'cors';
import express from 'express';
import Stripe from 'stripe';

const app = express();
const stripe = new Stripe('sk_test_51Pcwg3LFGACAQg9KDgWT030A3TpobONFPY4REjVIW1hsXVY7FModHICR565IdkBST01CjxMVEPIpf1M4zs0E2wCH00XkOASjxn'); 
app.use(cors());
app.use(express.json()); 

// In-memory store for processed sessions (replace with a persistent database in production)
const processedSessions = new Set();

app.post("/api/paymentgateway", async (req, res) => {
  try {
    const { nova_balance, currency, amount, userId } = req.body; 

    if (!currency) {
      throw new Error('Currency is required');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(), 
          product_data: { 
            name: "Add Funds",
            description: `Purchase ${nova_balance} Nova coins`
          },
          unit_amount: amount 
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: `http://localhost:3002/my-wallet?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:3002/my-wallet",
      metadata: {
        userId: userId,
        nova_balance: nova_balance.toString() 
      }
    });

    res.json({ id: session.id }); 
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/verify-payment", async (req, res) => {
  try {
    const { session_id } = req.body;
    console.log("Verifying payment for session ID:", session_id); 

    if (processedSessions.has(session_id)) {
      console.log("Session has already been processed.");
      return res.json({ success: false, message: 'Session has already been processed' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("Stripe session retrieved:", session);

    if (session.payment_status === 'paid') {
      const nova_balance = session.metadata.nova_balance;
      const userId = session.metadata.userId;
      console.log("Payment status is paid. Nova balance:", nova_balance); 

     
      processedSessions.add(session_id);

      res.json({ success: true, nova_balance, userId });
    } else {
      console.log("Payment status is not completed. Payment status:", session.payment_status);
      res.json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
