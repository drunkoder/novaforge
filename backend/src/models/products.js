import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required:true,
  },
}, { timestamps: true });

const ProductModel = mongoose.model("products", ProductSchema);

export default ProductModel;
