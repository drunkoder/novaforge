import express from "express";
import auth from "../routes/auth.js";
import users from "../routes/users.js";
import miningAreas from "../routes/miningAreas.js";
import products from "../routes/products.js";
import exchangeRates from "../routes/exchangeRates.js";

const app = express();

app.use(auth);
app.use(users);
app.use(miningAreas);
app.use(products);
app.use(exchangeRates);


export default app;
