import express from "express";
import mongoose, { Schema } from "mongoose";
import UserModel from "../models/users.js";
import CommunityProductModel from "../models/community_products.js";
import { validateToken } from "../middlewares/auth.js";
import { inventoryStatus, communityProductStatus, transactionTypes } from "../utils/enums.js";
import TransactionModel from "../models/transactions.js";
import MiningAreaModel from "../models/mining_areas.js";

const app = express();

app.get("/api/community/:userId/sale-items", [validateToken], async (req, res) => {
  try {
    const { userId } = req.params;
    const { search = '', page = 1, limit = 10 } = req.query;
    const searchRegex = new RegExp(search, 'i'); 
    const buyerId = new mongoose.Types.ObjectId(userId);

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
            { "status": communityProductStatus.AVAILABLE },
            //{ "user._id": { $ne: userId }},
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
      },
      {
        $match: {
          "user._id": { $ne:  buyerId} 
        }
      }   
    ];

    console.log(mainPipeline);
    const countPipeline = [...mainPipeline];
    countPipeline.push({ 
      $group: { _id: null, count: { $sum: 1 } }
  });
    const projectionPipeline = [...mainPipeline];
    projectionPipeline.push({ 
      $project: {
        //_id: 1, 
        user_id: 1,
        purchased_product_id: 1,
        "user.first_name": 1,
        "user.last_name": 1,
        "product.name": 1,
        "product.image": 1,
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

    const totalDocs = await CommunityProductModel.aggregate(countPipeline);

    const totalPages = Math.ceil(totalDocs.length ? totalDocs[0].count / parseInt(limit) : 0);
    const communityProducts = await CommunityProductModel.aggregate(projectionPipeline)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));
    
    const formattedProducts = communityProducts.map(product => ({
      ...product,
      user: {
        first_name: product.user[0]?.first_name,
        last_name: product.user[0]?.last_name
      },
      product: {
        name: product.product[0].name,
        description: product.product[0].description,
        image: product.product[0].image
      },
      mining_area: {
        name: product.mining_area[0].name,
        description: product.mining_area[0].description
      }
    }));

    console.log(formattedProducts);
    return res.status(200).json({
      "products": formattedProducts,
      totalPages,
      currentPage: parseInt(page),
      totalDocuments: totalDocs.length ? totalDocs[0].count : 0
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error searching community products" });
  }
});

app.post('/api/community/:userId/buy/:communityProductId', [validateToken], async (request, response) => {
  const { userId, communityProductId } = request.params;
  const { quantity } = request.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const opts = { session };
    const communityProduct = await CommunityProductModel.findById(communityProductId).session(session);

    if (!communityProduct || communityProduct.status !== communityProductStatus.AVAILABLE || communityProduct.quantity < quantity) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Community product not available for purchase' });
    }

    console.log(userId, communityProduct.user_id.toString());
    if (userId === communityProduct.user_id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'You cannot buy your own product.' });
    }

    const buyer = await UserModel.findById(userId).session(session);

    if (!buyer) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Buyer not found' });
    }


    const seller = await UserModel.findById(communityProduct.user_id).session(session);

    if (!seller) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Seller not found' });
    }

    // Calculate total price
    const totalPrice = communityProduct.price * quantity;

    // Check if buyer has enough coins
    if (buyer.nova_coin_balance < totalPrice) {
      await session.abortTransaction();
      session.endSession();
      return response.status(400).json({ message: 'You have insufficient coins' });
    }

    // Create transaction for buyer
    const newTransaction = new TransactionModel({
      buyer_id: userId,
      seller_id: seller._id,
      product_id: communityProduct.product_id,
      mining_area_id: communityProduct.mining_area_id,
      quantity,
      coins_used: totalPrice,
      transaction_type: transactionTypes.BUY,
      is_community: true
    });

    await newTransaction.save(opts);

    // Update seller's nova coins
    seller.nova_coin_balance += totalPrice;
    await seller.save(opts);

    // Update buyer's nova coins
    buyer.nova_coin_balance -= totalPrice;

    // Update community product quantity
    communityProduct.quantity -= quantity;

    // Update or add purchased product in buyer's inventory
    let updated = false;
    for (let i = 0; i < buyer.purchased_products.length; i++) {
      if (buyer.purchased_products[i].product_id.equals(communityProduct.product_id) &&
          buyer.purchased_products[i].mining_area_id.equals(communityProduct.mining_area_id)) {
        // If product and mining area match, update quantity
        buyer.purchased_products[i].quantity += quantity;
        updated = true;
        break;
      }
    }

    // If no matching product and mining area found, add new entry
    if (!updated) {
      buyer.purchased_products.push({
        product_id: communityProduct.product_id,
        mining_area_id: communityProduct.mining_area_id,
        price: communityProduct.price,
        quantity,
        purchase_date: new Date(),
        status: inventoryStatus.AVAILABLE
      });
    }

    // If no quantity left, update status to SOLD
    if (communityProduct.quantity === 0) {
      communityProduct.status = communityProductStatus.SOLD;
    }

    await communityProduct.save(opts);
    
    await buyer.save(opts);
    
    await session.commitTransaction();
    session.endSession();

    return response.status(200).json({ message: 'Product successfully purchased' });

  } catch (error) {
    console.error('Error buying product:', error);
    await session.abortTransaction();
    session.endSession();
    return response.status(500).json({ message: 'Server error while purchasing product' });
  }
});

app.post('/api/planetarium/:userId/buy', [validateToken], async (request, response) => {
  const { userId } = request.params;
  const { miningAreaId, productId, quantity } = request.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const opts = { session };
    
    // Check if mining area exists
    const miningArea = await MiningAreaModel.findById(miningAreaId)
                      .populate({
                        path: 'products.product_id',
                        select: '_id code name description image price'
                    }).session(session);

    if (!miningArea) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Mining area of the product is non-existent' });
    }

    const filteredProduct = miningArea.products.filter(product => product.product_id._id.toString() === productId);

    // Check if product exists
    if (!filteredProduct || filteredProduct.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Product does not exist' });
    }

    const productToBuy = filteredProduct[0];
    const buyer = await UserModel.findById(userId).session(session);

    if (!buyer) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Buyer not found' });
    }


    const seller = await UserModel.findOne({ is_system: true }).session(session);

    if (!seller) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Seller not found' });
    }

    // Calculate total price
    const totalPrice = productToBuy.price * quantity;

    // Check if buyer has enough coins
    if (buyer.nova_coin_balance < totalPrice) {
      await session.abortTransaction();
      session.endSession();
      return response.status(400).json({ message: 'You have insufficient coins' });
    }

    // Create transaction for buyer
    const newTransaction = new TransactionModel({
      buyer_id: userId,
      seller_id: seller._id,
      product_id: productId,
      mining_area_id: miningAreaId,
      quantity,
      coins_used: totalPrice,
      transaction_type: transactionTypes.BUY,
      is_community: false
    });

    await newTransaction.save(opts);

    // Update buyer's nova coins
    buyer.nova_coin_balance -= totalPrice;

    // Update product inventory quantity
    productToBuy.quantity -= quantity;

    var productIdObj = new mongoose.Types.ObjectId(productId);
    const result = await MiningAreaModel.findOneAndUpdate(
        { _id: miningAreaId, 'products.product_id': productIdObj },
        { $set: { 'products.$.quantity': productToBuy.quantity } },
        { new: true, session }
    );
  
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({ message: 'Mining area or product not found' });
  }

    // Update or add purchased product in buyer's inventory
    let updated = false;
    for (let i = 0; i < buyer.purchased_products.length; i++) {
      //console.log(buyer.purchased_products[i].product_id._id.toString(), productId);
      //console.log(buyer.purchased_products[i].mining_area_id._id.toString(), miningAreaId);
      if (buyer.purchased_products[i].product_id._id.toString() === productId &&
          buyer.purchased_products[i].mining_area_id._id.toString() === miningAreaId) {
        // If product and mining area match, update quantity
        buyer.purchased_products[i].quantity += quantity;
        updated = true;
        break;
      }
    }

    // If no matching product and mining area found, add new entry
    if (!updated) {
      buyer.purchased_products.push({
        product_id: productId,
        mining_area_id: miningAreaId,
        price: productToBuy.price,
        quantity,
        purchase_date: new Date(),
        status: inventoryStatus.AVAILABLE
      });
    }
  
    await buyer.save(opts);
    
    await session.commitTransaction();
    session.endSession();

    return response.status(200).json({ message: 'Product successfully purchased' });

  } catch (error) {
    console.error('Error buying product:', error);
    await session.abortTransaction();
    session.endSession();
    return response.status(500).json({ message: 'Server error while purchasing product' });
  }
});

export default app;
