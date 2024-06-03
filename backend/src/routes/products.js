import express from "express";
import ProductModel from "../models/products.js";
import { v4 as uuidv4 } from 'uuid';
import { validateToken } from "../middlewares/auth.js";

const app = express();

// Gets all
app.get("/api/products", [validateToken], async (req, res) => {
  try {
      const products = await ProductModel.find();
      return res.status(200).json(products);
  } catch (error) {
      return res.status(500).json({
          error: "Database error",
          message: error.message,
      });
  }
});


// Get a product by ID with its products
app.get("/api/products/:id", [validateToken], async (req, res) => {
  try {
      const product = await ProductModel.findById(req.params.id);
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json(product);
  } catch (error) {
      return res.status(500).json({
          error: "Database error",
          message: error.message,
      });
  }
});

// Create
app.post("/api/products", [validateToken], async (req, res) => {
  try {
      const { name, description, image } = req.body;
      const code = uuidv4();
      const product = new ProductModel({ code, name, description, image });
      await product.save();
      
      return res.status(201).json({
          message: "Product created",
          product: product,
      });
  } catch (error) {
      return res.status(400).json({
          error: "Database error",
          message: error.message,
      });
  }
});

// Update
app.put("/api/products/:id", [validateToken], async (req, res) => {
    try {
        const { name, description, image } = req.body;
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            req.params.id,
            { name, description, image },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({
            message: "Product updated",
            product: updatedProduct,
        });
    } catch (error) {
        return res.status(500).json({
            error: "Database error",
            message: error.message,
        });
    }
});


// Delete
app.delete("/api/products/:id", [validateToken], async (req, res) => {
    try {

        // Check if the product is used in any mining area products. Do not allow deletion
        const productInUse = await ProductModel.findOne({ product: req.params.id });
        if (productInUse) {
            return res.status(400).json({ message: "A mining area has owned this product and cannot be deleted" });
        }

        // If the product is not in use, delete it
        const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        return res.status(500).json({
            error: "Database error",
            message: error.message,
        });
    }
});

export default app;
