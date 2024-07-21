import express from "express";
import auth from "../routes/auth.js";
import users from "../routes/users.js";
import miningAreas from "../routes/miningAreas.js";
import products from "../routes/products.js";
import exchangeRates from "../routes/exchangeRates.js";
import market from "../routes/market.js";
import forgotPassword from "../routes/forgotPassword.js"
import transactions from "../routes/transactions.js";
import stripe from "../routes/Stripe.js";
const app = express();

app.use(auth);
app.use(users);
app.use(miningAreas);
app.use(products);
app.use(exchangeRates);
app.use(market);
app.use(forgotPassword);
app.use(transactions);
app.use(stripe);
export default app;
