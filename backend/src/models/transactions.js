import mongoose, { Schema } from "mongoose";

// TODO: Add more fields

const TransactionSchema = new Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
});

const TransactionModel = mongoose.model("transactions", TransactionSchema);

export default TransactionModel;
