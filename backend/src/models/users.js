import mongoose, { Schema } from "mongoose";
import { userRoles } from "../utils/enums.js";

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: String,
  created_by: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: String
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: Object.values(userRoles),
    default: 'User',
  },
  nova_coin_balance: {
    type: Number,
    default: 0,
  },
  purchased_products: [{
    product_id: { type: Schema.Types.ObjectId, ref: 'products' },
    mining_area_id: { type: Schema.Types.ObjectId, ref: 'mining_areas' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    purchase_date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['AVAILABLE', 'SOLD', 'FOR_SALE'],
      default: 'AVAILABLE'
    }
  }],
 
  resetPasswordToken: {type: String,
  default: '',},

  resetPasswordExpires :{type: Date,
  default: Date.now}
});

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
