import mongoose, { Schema } from "mongoose";
import { transactionTypes } from "../utils/enums.js";

// TODO: Add more fields

const TransactionSchema = new Schema({
  buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
  mining_area_id: { type: mongoose.Schema.Types.ObjectId, ref: 'mining_areas', required: true },
  quantity: { type: Number, required: true  },
  coins_used: { type: Number, required: true  },
  transaction_type: { 
    type: String,
    enum: [transactionTypes.BUY, transactionTypes.SELL, transactionTypes.CANCELLATION]
  },
  is_community: { type: Boolean, required: true },
  created_at: { type: Date, default: Date.now }
});

const TransactionModel = mongoose.model("transactions", TransactionSchema);

export default TransactionModel;
