import express from "express";
import MiningAreaModel from "../models/mining_areas.js";
import MiningAreaProductModel from "../models/mining_area_products.js";
import { validateToken } from "../middlewares/auth.js";
import UserModel from "../models/users.js";
import CommunityProductModel from "../models/community_products.js";
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

//update
// Helper function for deep comparison of arrays
const deepEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
  
    const sortedArr1 = [...arr1].sort((a, b) => a.product_id.toString().localeCompare(b.product_id.toString()));
    const sortedArr2 = [...arr2].sort((a, b) => a.product_id.toString().localeCompare(b.product_id.toString()));
  
    return sortedArr1.every((item, index) => 
      item.product_id.toString() === sortedArr2[index].product_id.toString() &&
      item.price === sortedArr2[index].price &&
      item.quantity === sortedArr2[index].quantity
    );
  };
  
  

  const productBeingUsed = (productId, miningAreaId) => {
    console.log(productId, miningAreaId)
    return UserModel.findOne({
        purchased_products: {
          $elemMatch: {
            product_id: productId,
            mining_area_id: miningAreaId
          }
        }
    })
    .then(u => {
        console.log(u);
      return !!u;
    })
    .catch(err => {
      console.error('Error checking user purchased products:', err);
      throw err; 
    });
  };

  app.put("/api/miningareas/:id", [validateToken], async (req, res) => {
      try {
          const { name, type, description, image, products } = req.body;
  
          // Find the existing mining area
          const existingMiningArea = await MiningAreaModel.findById(req.params.id);
          if (!existingMiningArea) {
              return res.status(404).json({ message: "Mining area not found" });
          }
  
          // Log for debugging
          console.log('Existing Mining Area Products:', existingMiningArea.products);
          console.log('New Products:', products);
  
          
          // Check if the data has changed
          const isSameData = 
              existingMiningArea.name === name &&
              existingMiningArea.type === type &&
              existingMiningArea.description === description &&
              existingMiningArea.image === image &&
              deepEqual(existingMiningArea.products, products);
             
          console.log('Is Same Data:', isSameData);
  
          if (isSameData) {
              return res.status(200).json({ message: "No changes made" });
          }
  
          if (existingMiningArea.products.length > products.length) {
            const deletedProducts = existingMiningArea.products.filter(p => !products.some(pp => pp.product_id.toString() == p.product_id.toString()));
            console.log('deleted products:', deletedProducts);
            console.log('existing products:', existingMiningArea.products);
          
            // Check if any of the deleted products are used in other mining areas
            const usedInOtherMiningAreas = await Promise.all(deletedProducts.map(async deletedProduct => {
                console.log(deletedProduct);
                console.log(existingMiningArea);
                return await productBeingUsed(deletedProduct.product_id, existingMiningArea._id);
              }));
              
              // Check if any product is being used in other mining areas
              if (usedInOtherMiningAreas.some(isBeingUsed => isBeingUsed)) {
                return res.status(400).json({ message: "Some deleted products were already bought by users. Cannot delete." });
              }
          
            // Check if any of the deleted products are used in community products
            const deletedProductIds = deletedProducts.map(p => p.id);
          
            CommunityProductModel.find({ product_id: { $in: deletedProductIds } })
              .then(communityProducts => {
                if (communityProducts.length > 0) {
                  return res.status(400).json({ message: "Some deleted products are used in community products. Cannot delete." });
                } 
              })
              .catch(err => {
                console.error('Error checking community products:', err);
                return res.status(500).json({ message: "Error checking community products" });
              });
          } 

          // Update the mining area if changes are detected
          const updatedMiningArea = await MiningAreaModel.findByIdAndUpdate(
              req.params.id,
              { name, type, description, image, products },
              { new: true, runValidators: true }
          );
  
          return res.status(200).json({
              message: "Mining area updated",
              miningArea: updatedMiningArea,
          });
  
      } catch (error) {
          console.error('Error updating mining area:', error);
          return res.status(500).json({
              error: "Database error",
              message: error.message,
          });
      }
  });
  

 

// Delete
app.delete("/api/miningareas/:id", [validateToken], async (req, res) => {
    try {
      // Check if the mining area is referenced in any user's purchased products
      const userWithMiningArea = await UserModel.findOne({ "purchased_products.mining_area_id": req.params.id });
      
      if (userWithMiningArea) {
        return res.status(400).json({ message: "Cannot delete this mining area because it is already in use" });
      }
      
      // Proceed with deletion if no references are found
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
