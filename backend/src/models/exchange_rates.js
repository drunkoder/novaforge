import mongoose, { Schema } from "mongoose";

const ExchangeRateSchema = new Schema({
    country_name: { type: String, required: true },
    code: { type: String, required: true },
    coins: { type: Number, required: true }
});

const ExchangeRateModel = mongoose.model("exchange_rates", ExchangeRateSchema);

export default ExchangeRateModel;
