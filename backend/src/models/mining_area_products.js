import mongoose, { Schema } from "mongoose";

const MiningAreaProductSchema = new Schema({
    mining_area_id: { type: mongoose.Schema.Types.ObjectId, ref: 'mining_areas', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
});

const MiningAreaProductModel = mongoose.model("mining_area_products", MiningAreaProductSchema);

export default MiningAreaProductModel;
