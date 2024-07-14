import express from "express";
import mongoose, { Schema } from "mongoose";
import UserModel from "../models/users.js";

import ExchangeRateModel from "../models/exchange_rates.js";
import { generatePassword } from "../utils/index.js";
import { validateToken } from "../middlewares/auth.js";
import { communityProductStatus, transactionTypes } from "../utils/enums.js";
import CommunityProductModel from "../models/community_products.js";
import TransactionModel from "../models/transactions.js";
import bcrypt from 'bcrypt';
const app = express();


// Get user by id
app.get("/api/users/:id", [validateToken], (request, response) => {
  const { id } = request.params;
  if (!id) {
    // Bad request
    return response.status(400).json({
      error: "bad request",
      message: "No ID provided",
    });
  }

  UserModel.findById(id)
  .then((user) => {
    if (!user) {
      return response.status(404).json({
        error: "User not found",
        message: "User with the provided ID does not exist",
      });
    }

    return response.status(200).json(user);
  })
  .catch((error) => {
    return response.status(400).json({
      error: "Error finding user",
      message: error.message,
    });
  });
  
});

// Get all users
app.get("/api/users", [validateToken], async (request, response) => {
  const { search, page, limit } = request.query;
  let filter = {};

  // Pagination parameters
  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 5;
  const skip = (pageNumber - 1) * pageSize;

  if (search) {
    filter = {
      $or: [
        { email: { $regex: search, $options: "i" } },
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } },
      ],
    };
  }

  try {
    const totalUsers = await UserModel.countDocuments(filter);
    const users = await UserModel.find(filter)
      .skip(skip)
      .limit(pageSize)
      .exec();

    const totalPages = Math.ceil(totalUsers / pageSize);

    const userVM = mapToViewModel(users);

    return response.status(200).json({
      users: userVM,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    return response.status(400).json({
      error: "Error finding users",
      message: error,
    });
  }
});


// Create user
app.post("/api/users", [validateToken], async (request, response) => {
  const body = request.body;
  if (!body || !body.password) {
    // Bad request
    return response.status(400).json({
      error: "bad request",
      message: "No body provided",
    });
  }

  const emailTaken = await isEmailTaken(body.email);
  if (emailTaken) {
    return response.status(400).json({
      error: "Email already exists",
      message: "The email is already in use",
    });
  }
  
  const password = await generatePassword(body.password);
  const newBody = { ...body, password };

  newBody.created_by = request.user.id,
  newBody.updated_by = request.user.id,
  newBody.created_at = new Date();
  newBody.updated_at = new Date();

  UserModel.create(newBody)
    .then((user) => {
      return response.status(201).json({
        message: "User created",
        user: user,
      });
    })
    .catch((error) => {
      return response.status(400).json({
        error: "Database error",
        message: error,
      });
    });
});

// Create user
app.post("/api/users/register", async (request, response) => {
  const body = request.body;
  if (!body || !body.password) {
    // Bad request
    return response.status(400).json({
      error: "bad request",
      message: "Please fill in required fields",
    });
  }

  const emailTaken = await isEmailTaken(body.email);
  if (emailTaken) {
    return response.status(400).json({
      error: "Email already exists",
      message: "The email is already in use",
    });
  }
  
  if(body.password !== body.confirmPassword){
    return response.status(400).json({
      error: "Passwords don't match",
      message: "Passwords don't match",
    });
  }

  const password = await generatePassword(body.password);
  const newBody = { ...body, password };

  newBody.created_at = new Date();
  newBody.updated_at = new Date();
  newBody.roles = [];
  newBody.roles = 'User';

  UserModel.create(newBody)
    .then((user) => {
      return response.status(201).json({
        message: "User created",
        user: user,
      });
    })
    .catch((error) => {
      return response.status(400).json({
        error: "Database error",
        message: error,
      });
    });
});


// Delete
app.delete("/api/users/:id", [validateToken], (request, response) => {
  const { id } = request.params;
  if (!id) {
    // Bad request
    return response.status(400).json({
      error: "bad request",
      message: "No ID provided",
    });
  }

  UserModel.findByIdAndDelete(id)
    .then((user) => {
      if (!user) {
        return response.status(404).json({
          error: "User not found",
          message: "User with provided ID not found",
        });
      }
      return response.status(200).json({
        message: "User deleted successfully",
        user: user,
      });
    })
    .catch((error) => {
      return response.status(400).json({
        error: "Error deleting user",
        message: error.message,
      });
    });
});

// Update
app.put("/api/users/:id", [validateToken], async (request, response) => {
  const { id } = request.params;
  const body = request.body;
  
  if (!id || !body) {
    return response.status(400).json({
      error: "Bad request",
      message: "No ID or body provided",
    });
  }

  const emailTaken = await isEmailTaken(body.email, id);
  if (emailTaken) {
    return response.status(400).json({
      error: "Email already exists",
      message: "The email is already in use",
    });
  }

  const user = await UserModel.findById(id);
  if (!user) {
    return response.status(404).json({
      error: "User not found",
      message: "User with provided ID not found",
    });
  }

  let updateFields = { ...body };

  // Check if password is provided and update it securely
  if (body.password) {
    const isSamePassword = await bcrypt.compare(body.password, user.password);
    if (isSamePassword) {
      return response.status(400).json({
        error: "Password already in use",
        message: "The new password cannot be the same as the current password",
      });
    }
    try {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      updateFields.password = hashedPassword;
    } catch (error) {
      return response.status(400).json({
        error: "Error generating password hash",
        message: error.message,
      });
    }
  }

  updateFields.updated_by = request.user.id;
  updateFields.updated_at = new Date();

  UserModel.findByIdAndUpdate(id, updateFields, { new: true })
    .then((updatedUser) => {
      return response.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    })
    .catch((error) => {
      return response.status(400).json({
        error: "Error updating user",
        message: error.message,
      });
    });
});


// buy nova coin
app.post("/api/users/:id/add-coins", [validateToken], async (request, response) => {
  const { id } = request.params;
  const { exchangeRateId, amount } = request.body;

  if (!id || !exchangeRateId || !amount) {
    return response.status(400).json({
      error: "bad request",
      message: "Missing required parameters",
    });
  }

  try {
    // Find the user
    const user = await UserModel.findById(id);
    if (!user) {
      return response.status(404).json({
        error: "User not found",
        message: "User with the provided ID does not exist",
      });
    }

    // Find exchange rate by ID
    const exchangeRate = await ExchangeRateModel.findById(exchangeRateId);
    if (!exchangeRate) {
      return response.status(404).json({
        error: "Exchange rate not found",
        message: "Exchange rate with the provided ID not available",
      });
    }

    // Calculate amount of coins based on exchange rate
    const coinsToAdd = amount / exchangeRate.coins;

    // Update nova_coin_balance
    user.nova_coin_balance += coinsToAdd;
    await user.save();

    var userVM = mapUserToViewModel(user);

    return response.status(200).json({
      message: "Coins added successfully",
      coinsAdded: coinsToAdd,
      updatedUser: userVM,
    });
  } catch (error) {
    return response.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// withdraw 
app.post("/api/users/:id/withdraw-coins", [validateToken], async (request, response) => {
  const { id } = request.params;
  const { amount } = request.body;

  if (!id || !amount) {
    return response.status(400).json({
      error: "bad request",
      message: "Missing required parameters",
    });
  }

  try {
    // Find the user
    const user = await UserModel.findById(id);
    if (!user) {
      return response.status(404).json({
        error: "User not found",
        message: "User with the provided ID does not exist",
      });
    }

    // Check if user has enough balance to withdraw
    if (user.nova_coin_balance < amount) {
      return response.status(400).json({
        error: "Insufficient balance",
        message: "You do not have enough coins to withdraw",
      });
    }

    // Update nova_coin_balance
    user.nova_coin_balance -= amount;
    await user.save();

    var userVM = mapUserToViewModel(user);

    return response.status(200).json({
      message: "Coins withdrawn successfully",
      coinsWithdrawn: amount,
      updatedUser: userVM,
    });
  } catch (error) {
    return response.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// My Inventory APIs
app.get('/api/users/:id/inventory', [validateToken], async (request, response) => {
  const { id } = request.params;
  const { status, search, page = 1, limit = 5 } = request.query;

  if (!id) {
    return response.status(400).json({
      error: 'bad request',
      message: 'No ID provided',
    });
  }

  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * pageSize;

  try {
    const user = await UserModel.findById(id)
      .populate('purchased_products.product_id')
      .populate('purchased_products.mining_area_id');

    if (!user) {
      return response.status(404).json({
        error: 'User not found',
        message: 'User with the provided ID does not exist',
      });
    }

    let inventory = user.purchased_products;


    // filter the status, AVAILABLE, SOLD, FOR_SALE
    if (status) {
      inventory = inventory.filter(product => product.status === status);
    }

    // if there's search keyword, search for area name or product name or status
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      inventory = inventory.filter(product =>
        searchRegex.test(product.product_id.name) || 
        searchRegex.test(product.mining_area_id.name) ||
        searchRegex.test(product.status)
      );
    }

    const totalPages = Math.ceil(inventory.length / pageSize);
    const paginatedInventory = inventory.slice(skip, skip + pageSize);

    response.status(200).json({ 
      totalItems: inventory.length,
      totalPages,
      currentPage: pageNumber,
      inventory: paginatedInventory
    });
  } catch (error) {
    return response.status(400).json({
      error: 'Error finding user inventory',
      message: error.message,
    });
  }
});

// app.get("/api/users/:id/inventory/:purchaseProductId/community", [validateToken], async (req, res) => {
//   try {
//     const { id, purchaseProductId } = req.params;
//     const { search = '', page = 1, limit = 10 } = req.query;
//     const searchRegex = new RegExp(search, 'i'); 

//     const pId = new mongoose.Types.ObjectId(purchaseProductId);
//     const uId = new mongoose.Types.ObjectId(id);

//     const mainPipeline = [
//       {
//         $lookup: { 
//           from: "users",
//           localField: "user_id",
//           foreignField: "_id",
//           as: "user"
//         }
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "product_id",
//           foreignField: "_id",
//           as: "product"
//         }
//       },
//       {
//         $lookup: { 
//           from: "mining_areas",
//           localField: "mining_area_id",
//           foreignField: "_id",
//           as: "mining_area"
//         }
//       },
//       {
//         $match: { 
//           $and: [
//             { "purchased_product_id": pId },
//             { "user_id": uId },
//             { 
//               $or: [
//                 { "user.first_name": { $regex: searchRegex } },
//                 { "user.last_name": { $regex: searchRegex } },
//                 { "product.name": { $regex: searchRegex } },
//                 { "product.description": { $regex: searchRegex } },
//                 { "mining_area.name": { $regex: searchRegex } },
//                 { "mining_area.description": { $regex: searchRegex } }
//               ]
//             }
//           ]
//         }
//       },       
//     ];

//     const countPipeline = [...mainPipeline];
//     countPipeline.push({ 
//       $group: { _id: null, count: { $sum: 1 } }
//     });

//     const projectionPipeline = [...mainPipeline];
//     projectionPipeline.push({ 
//       $project: {
//         //_id: 1, 
//         user_id: 1,
//         purchased_product_id: 1,
//         "user.first_name": 1,
//         "user.last_name": 1,
//         "product.name": 1,
//         "product.description": 1,
//         "mining_area.name": 1,
//         "mining_area.description": 1,
//         quantity: 1,
//         price: 1,
//         created_at: 1,
//         product_id: 1,
//         mining_area_id: 1,
//         status: 1
//       }
//     });

    
//     const totalDocs = await CommunityProductModel.aggregate(countPipeline);
//     console.log(totalDocs);
//     const totalPages = Math.ceil(totalDocs.length ? totalDocs[0].count / parseInt(limit) : 0);

//     console.log(projectionPipeline);
//     const communityProducts = await CommunityProductModel.aggregate(projectionPipeline)
//     .skip((parseInt(page) - 1) * parseInt(limit))
//     .limit(parseInt(limit));
    
//     const formattedProducts = communityProducts.map(product => ({
//       ...product,
//       user: {
//         first_name: product.user[0].first_name,
//         last_name: product.user[0].last_name
//       },
//       product: {
//         name: product.product[0].name,
//         description: product.product[0].description
//       },
//       mining_area: {
//         name: product.mining_area[0].name,
//         description: product.mining_area[0].description
//       }
//     }));

//     console.log(formattedProducts);
//     return res.status(200).json({
//       "products": formattedProducts,
//       totalPages,
//       currentPage: parseInt(page),
//       totalDocuments: totalDocs.length ? totalDocs[0].count : 0
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "Error searching community products" });
//   }
// });

//  community products 
app.get("/api/users/:id/inventory/:purchaseProductId?/community", [validateToken], async (req, res) => {
  try {
    const { id, purchaseProductId } = req.params;
    const { search = '', page = 1, limit = 10, status = '' } = req.query;
    const searchRegex = new RegExp(search, 'i');

    const uId = new mongoose.Types.ObjectId(id);

    const mainPipeline = [
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $lookup: {
          from: "mining_areas",
          localField: "mining_area_id",
          foreignField: "_id",
          as: "mining_area"
        }
      },
      {
        $match: {
          $and: [
            { "user_id": uId },
            {
              $or: [
                { "user.first_name": { $regex: searchRegex } },
                { "user.last_name": { $regex: searchRegex } },
                { "product.name": { $regex: searchRegex } },
                { "product.description": { $regex: searchRegex } },
                { "mining_area.name": { $regex: searchRegex } },
                { "mining_area.description": { $regex: searchRegex } }
              ]
            }
          ]
        }
      }
    ];

    if (purchaseProductId) {
      const pId = new mongoose.Types.ObjectId(purchaseProductId);
      mainPipeline[3].$match.$and.push({ "purchased_product_id": pId });
    }

    if (status) {
      mainPipeline[3].$match.$and.push({ "status": status });
    }

    // sorting stage to the pipeline
    mainPipeline.push({ $sort: { created_at: -1 } });

    const countPipeline = [...mainPipeline];
    countPipeline.push({
      $count: "count"
    });

    // total number of documents that match the criteria
    const totalDocsResult = await CommunityProductModel.aggregate(countPipeline);
    const totalDocs = totalDocsResult.length ? totalDocsResult[0].count : 0;
    const totalPages = Math.ceil(totalDocs / parseInt(limit));

    const projectionPipeline = [...mainPipeline];
    projectionPipeline.push({
      $project: {
        user_id: 1,
        purchased_product_id: 1,
        "user.first_name": 1,
        "user.last_name": 1,
        "product.name": 1,
        "product.description": 1,
        "mining_area.name": 1,
        "mining_area.description": 1,
        quantity: 1,
        price: 1,
        created_at: 1,
        product_id: 1,
        mining_area_id: 1,
        status: 1
      }
    });

    const communityProducts = await CommunityProductModel.aggregate(projectionPipeline)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const formattedProducts = communityProducts.map(product => ({
      ...product,
      user: {
        first_name: product.user[0].first_name,
        last_name: product.user[0].last_name
      },
      product: {
        name: product.product[0].name,
        description: product.product[0].description
      },
      mining_area: {
        name: product.mining_area[0].name,
        description: product.mining_area[0].description
      }
    }));

    return res.status(200).json({
      products: formattedProducts,
      totalPages,
      currentPage: parseInt(page),
      totalDocuments: totalDocs
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error searching community products" });
  }
});

// sell API here
app.post('/api/users/:id/sell/:purchaseProductId', [validateToken], async (request, response) => {
  const { id, purchaseProductId } = request.params;
  const { quantity } = request.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const opts = { session };
    const user = await UserModel.findById(id);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'User not found' });
    }

    const purchasedProduct = user.purchased_products.find(
      (product) => product._id.toString() === purchaseProductId
    );

    if (!purchasedProduct || purchasedProduct.quantity < 1) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Purchased product not found' });
    }

    if (purchasedProduct.quantity < quantity) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Not enough quantity' });
    }

    if (purchasedProduct.status !== 'AVAILABLE') {
      await session.abortTransaction();
      session.endSession();
      return response.status(400).json({ message: 'Product is not available for sale' });
    }

    // Insert community product
    const newCommunityProduct = new CommunityProductModel({
      purchased_product_id: purchasedProduct._id,
      user_id: id,
      product_id: purchasedProduct.product_id,
      mining_area_id: purchasedProduct.mining_area_id,
      status: communityProductStatus.AVAILABLE, 
      quantity: quantity,
      price: purchasedProduct.price
    });

    // Save
    await newCommunityProduct.save(opts);

    // Create transaction
    const newTransaction = new TransactionModel({
      buyer_id: null,
      seller_id: id,
      product_id: purchasedProduct.product_id,
      mining_area_id: purchasedProduct.mining_area_id,
      quantity: quantity,
      coins_used: 0,
      transaction_type: transactionTypes.SELL,
      is_community: true
    });

    // Save transaction
    await newTransaction.save(opts);

    // Update the quantity of the purchased product
    purchasedProduct.quantity -= quantity;

    // If all quantity is up for sale, update status to FOR_SALE
    if (purchasedProduct.quantity === 0) {
      purchasedProduct.status = 'FOR_SALE';
    }

    await user.save();

    await session.commitTransaction();
    session.endSession();

    return response.status(200).json({ message: 'Product successfully listed for sale' });

  } catch (error) {
    console.error('Error selling product:', error);
    await session.abortTransaction();
    session.endSession();
    return response.status(500).json({ message: 'Server error while selling product' });
  }
});

// here to cancel products for sale in community market
app.post('/api/users/:id/cancel-sell/:communityProductId', [validateToken], async (request, response) => {
  const { id, communityProductId } = request.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const opts = { session };

    // Find the community product to cancel
    const communityProduct = await CommunityProductModel.findById(communityProductId).session(session);
    if (!communityProduct || communityProduct.status !== communityProductStatus.AVAILABLE) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Community product not found' });
    }

    // Check if the community product belongs to the user
    if (communityProduct.user_id.toString() !== id) {
      await session.abortTransaction();
      session.endSession();
      return response.status(403).json({ message: 'Unauthorized to cancel this sell' });
    }

    // Find the corresponding purchased product in the user's profile
    const user = await UserModel.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'User not found' });
    }

    const purchasedProduct = user.purchased_products.find(
      (product) => product._id.toString() === communityProduct.purchased_product_id.toString()
    );

    if (!purchasedProduct) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Corresponding purchased product not found' });
    }

    // Update the community product status to CANCELLED
    communityProduct.status = communityProductStatus.CANCELLED;
    await communityProduct.save(opts);

    // Create a cancelled transaction
    const cancelledTransaction = new TransactionModel({
      buyer_id: null,
      seller_id: id,
      product_id: communityProduct.product_id,
      mining_area_id: communityProduct.mining_area_id,
      quantity: communityProduct.quantity,
      coins_used: 0,
      transaction_type: transactionTypes.CANCELLATION,
      is_community: true
    });

    await cancelledTransaction.save(opts);

    // Update the purchased product status to AVAILABLE if it was previously FOR_SALE
    if (purchasedProduct.status === 'FOR_SALE') {
      purchasedProduct.status = 'AVAILABLE';
    }

    console.log(purchasedProduct.quantity, communityProduct.quantity);
    // Update the quantity of the purchased product
    purchasedProduct.quantity += communityProduct.quantity;

    // Save the updated user data
    await user.save(opts);

    await session.commitTransaction();
    session.endSession();

    return response.status(200).json({ message: 'Sell cancellation successful' });

  } catch (error) {
    console.error('Error cancelling sell:', error);
    await session.abortTransaction();
    session.endSession();
    return response.status(500).json({ message: 'Server error while cancelling sell' });
  }
});

// private methods here
function mapToViewModel(users) {
  return users.map(user => ({
    id: user._id.toString(),
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    friendly_name: `${user.first_name} ${user.last_name}`,
    role: user.role
  }));
}

function mapUserToViewModel(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    friendly_name: `${user.first_name} ${user.last_name}`,
    role: user.role,
    nova_coin_balance: user.nova_coin_balance
  };
}


async function isEmailTaken(email, userId = null) {
  try {
    const query = { email: email };
    if (userId) {
      query._id = { $ne: userId };
    }
    const existingUser = await UserModel.findOne(query);
    return !!existingUser;
  } catch (error) {
    console.error("Error checking email:", error.message);
    return true;
  }
}



export default app;
