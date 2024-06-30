import mongoose, { Schema } from "mongoose";

const MiningAreaSchema = new Schema({
    name: { type: String, required: true, index: true },
    type: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    products: [
        {   
            product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true } 
        }]
});

const MiningAreaModel = mongoose.model("mining_areas", MiningAreaSchema);

export default MiningAreaModel;
