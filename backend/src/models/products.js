import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String }
});

const ProductModel = mongoose.model("products", ProductSchema);

export default ProductModel;
