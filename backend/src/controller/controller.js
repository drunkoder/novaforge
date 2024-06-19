import express from "express";
import auth from "../routes/auth.js";
import users from "../routes/users.js";
import miningAreas from "../routes/miningAreas.js";
import products from "../routes/products.js";
import exchangeRates from "../routes/exchangeRates.js";
import market from "../routes/market.js";

const app = express();

app.use(auth);
app.use(users);
app.use(miningAreas);
app.use(products);
app.use(exchangeRates);
app.use(market);
export default app;
