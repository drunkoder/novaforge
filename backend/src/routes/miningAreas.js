import express from "express";
import MiningAreaModel from "../models/mining_areas.js";
import MiningAreaProductModel from "../models/mining_area_products.js";
import { validateToken } from "../middlewares/auth.js";

const app = express();

// Gets all but paginated and searchable by name
app.get("/api/miningareas", [validateToken], async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (search) {
        const searchRegex = new RegExp(search, 'i');
  query.$or = [
    { name: { $regex: searchRegex } },
    { description: { $regex: searchRegex } },
    //{ 'products.product_id.name': { $regex: searchRegex } }
  ];
    }

    const totalDocuments = await MiningAreaModel.countDocuments(query);
    const totalPages = Math.ceil(totalDocuments / parseInt(limit));

    const miningAreas = await MiningAreaModel.find(query)
        .skip(skip)
        .limit(parseInt(limit));

    return res.status(200).json({
        miningAreas,
        totalPages,
        currentPage: parseInt(page),
        totalDocuments
    });
  } catch (error) {
      return res.status(500).json({
          error: "Database error",
          message: error.message,
      });
  }
});

// Get a mining area by ID with its products
app.get("/api/miningareas/:id", [validateToken], async (req, res) => {
  try {
      const miningArea = await MiningAreaModel.findById(req.params.id);
      if (!miningArea) {
          return res.status(404).json({ message: "Mining area not found" });
      }
      return res.status(200).json(miningArea);
  } catch (error) {
      return res.status(500).json({
          error: "Database error",
          message: error.message,
      });
  }
});

// Create
app.post("/api/miningareas", [validateToken], async (req, res) => {
  try {
      const { name, type, description, image, products } = req.body;
      const miningArea = new MiningAreaModel({ name, type, description, image, products });
      await miningArea.save();
      
      return res.status(201).json({
          message: "Mining area created",
          miningArea: miningArea,
      });
  } catch (error) {
      return res.status(400).json({
          error: "Database error",
          message: error.message,
      });
  }
});

// Update
app.put("/api/miningareas/:id", [validateToken], async (req, res) => {
  try {
      const { name, type, description, image, products } = req.body;
      const updatedMiningArea = await MiningAreaModel.findByIdAndUpdate(req.params.id, { name, type, description, image, products }, { new: true });
      if (!updatedMiningArea) {
          return res.status(404).json({ message: "Mining area not found" });
      }
      return res.status(200).json({
          message: "Mining area updated",
          miningArea: updatedMiningArea,
      });
  } catch (error) {
      return res.status(500).json({
          error: "Database error",
          message: error.message,
      });
  }
});

// Delete
app.delete("/api/miningareas/:id", [validateToken], async (req, res) => {
  try {
      const deletedMiningArea = await MiningAreaModel.findByIdAndDelete(req.params.id);
      if (!deletedMiningArea) {
          return res.status(404).json({ message: "Mining area not found" });
      }
      // Delete associated mining area products
      await MiningAreaProductModel.deleteMany({ miningArea: req.params.id });
      return res.status(200).json({ message: "Mining area deleted" });
  } catch (error) {
      return res.status(500).json({
          error: "Database error",
          message: error.message,
      });
  }
});

// Get products of a mining area
app.get("/api/miningareas/:id/products", [validateToken], async (req, res) => {
  try {
      const { page = 1, limit = 10, search = '', type = '' } = req.query;

      // Calculate pagination options
      const options = {
          page: parseInt(page),
          limit: parseInt(limit),
      };

      const query = {
          _id: req.params.id,
          // $or: [
          //     { 'products.product_id.code': { $regex: new RegExp(search, 'i') } }, // Search by product code
          //     { 'products.product_id.name': { $regex: new RegExp(search, 'i') } },
          // ]
      };

      const miningArea = await MiningAreaModel.findOne({ _id: req.params.id })
            .populate({
                path: 'products.product_id',
                select: 'code name description image'
            })
            .exec();

        if (!miningArea) {
            return res.status(404).json({ message: "Mining area not found" });
        }

        const filteredProducts = miningArea.products.filter(product => 
            new RegExp(search, 'i').test(product.product_id.name) || 
            new RegExp(search, 'i').test(product.product_id.code)
        );

        const paginatedProducts = filteredProducts.slice((options.page - 1) * options.limit, options.page * options.limit);

        const products = paginatedProducts.map(product => ({
            code: product.product_id.code,
            name: product.product_id.name,
            description: product.product_id.description,
            image: product.product_id.image,
            price: product.price,
            quantity: product.quantity,
            product_id: product.product_id._id,
            mining_area_id: req.params.id
        }));

      return res.status(200).json({
          _id: req.params.id,
          products: products
      });
  } catch (error) {
      return res.status(500).json({
          error: "Database error",
          message: error.message,
      });
  }
});


// TODO: Add more inventory related APIs

app.put("/api/miningareas/:miningAreaId/products/:productId/quantity", [validateToken], async (req, res) => {
  try {
      const { miningAreaId, productId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 0) {
          return res.status(400).json({ message: "Invalid quantity" });
      }

      // Find the mining area
      const miningArea = await MiningAreaModel.findById(miningAreaId);
      if (!miningArea) {
          return res.status(404).json({ message: "Mining area not found" });
      }

      // Find the product within the mining area
      const product = miningArea.products.find(product => product.product_id.toString() === productId);
      if (!product) {
          return res.status(404).json({ message: "Product not found in the specified mining area" });
      }

      // Update the quantity
      product.quantity = quantity;

      // Save the mining area with updated product quantity
      await miningArea.save();

      return res.status(200).json({ message: "Product quantity updated successfully", miningArea });
  } catch (error) {
      return res.status(500).json({
          error: "Database error",
          message: error.message,
      });
  }
});


export default app;
