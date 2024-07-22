import multer from 'multer';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ProductModel from '../models/products.js';
import { validateToken } from '../middlewares/auth.js';
import MiningAreaModel from '../models/mining_areas.js';

const app = express();

// Utility function to get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to ensure the directory exists
const ensureUploadsDirExists = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log(`Creating uploads directory at: ${uploadsDir}`);
    fs.mkdirSync(uploadsDir, { recursive: true });
  } else {
    console.log(`Uploads directory already exists at: ${uploadsDir}`);
  }
};

ensureUploadsDirExists(); // Ensure the directory exists when the server starts

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureUploadsDirExists();
    cb(null, path.join(__dirname, '..', 'uploads')); // Use absolute path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Gets all products with optional search and pagination
app.get("/api/products", [validateToken], async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const searchOptions = search ? { name: { $regex: search, $options: 'i' } } : {};
    
    const products = await ProductModel.find(searchOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalProducts = await ProductModel.countDocuments(searchOptions);
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({ products, totalPages });
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).json({
      error: "Database error",
      message: error.message,
    });
  }
});

// Get a product by ID
app.get("/api/products/:id", [validateToken], async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product by ID:", error);
    return res.status(500).json({
      error: "Database error",
      message: error.message,
    });
  }
});

// Create a new product with an image
app.post("/api/products", [validateToken], upload.single('image'), async (req, res) => {
  try {
    const { code, name, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // Store relative path to image

    console.log(code, name, description, req.file ? req.file.filename : "No file uploaded");

    // Check if a product with the given code already exists
    const existingProduct = await ProductModel.findOne({ code });
    if (existingProduct) {
      return res.status(400).json({ message: "Product with this code already exists" });
    }

    const product = new ProductModel({ code, name, description, image });
    await product.save();

    return res.status(201).json({
      message: "Product created",
      product: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(400).json({
      error: "Database error",
      message: error.message,
    });
  }
});

// Update a product by ID with an image
app.put("/api/products/:id", [validateToken], upload.single('image'), async (req, res) => {
  try {
    const { code, name, description } = req.body;
    
    // Fetch the current product data
    const currentProduct = await ProductModel.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Determine the new image path
    const image = req.file ? `/uploads/${req.file.filename}` : currentProduct.image;
    
    // Check if a product with the same code already exists (except the current product)
    const existingProduct = await ProductModel.findOne({ code, _id: { $ne: req.params.id } });
    if (existingProduct) {
      return res.status(400).json({ message: "Product with this code already exists" });
    }
    
    // Compare current data with new data
    const isSameData =
      currentProduct.code === code &&
      currentProduct.name === name &&
      currentProduct.description === description &&
      currentProduct.image === image;

    console.log("Current Product Data:", currentProduct);
    console.log("New Product Data:", { code, name, description, image });
    console.log("Is Same Data:", isSameData);

    if (isSameData) {
      return res.status(200).json({ message: "No changes made" });
    }

    // Proceed with the update
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      { code, name, description, image },
      { new: true, runValidators: true }
    );

    console.log("Updated Product Data:", updatedProduct);

    return res.status(200).json({
      message: "Product updated",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      error: "Database error",
      message: error.message,
    });
  }
});

// Delete a product by ID
app.delete("/api/products/:id", [validateToken], async (req, res) => {
  try {
    // Check if the product is used in any mining area
    console.log(req.params.id);
    const productInUse = await MiningAreaModel.findOne({ 'products.product_id': req.params.id });
    console.log(productInUse);
    if (productInUse) {
      return res.status(400).json({ message: "This product is already used in a mining area and cannot be deleted" });
    }

    // If the product is not in use, delete it
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      error: "Database error",
      message: error.message,
    });
  }
});

export default app;
