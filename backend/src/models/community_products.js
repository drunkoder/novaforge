import mongoose, { Schema } from "mongoose";

const CommunityProductSchema = new Schema({
  purchased_product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users.purchased_products',
    required: true
  },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
  mining_area_id: { type: mongoose.Schema.Types.ObjectId, ref: 'mining_areas', required: true },
  status: {
    type: String,
    enum: ['AVAILABLE', 'SOLD', 'CANCELLED'],
    default: 'AVAILABLE'
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const CommunityProductModel = mongoose.model("community_products", CommunityProductSchema);

export default CommunityProductModel;