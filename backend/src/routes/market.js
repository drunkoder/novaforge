import express from "express";
import mongoose, { Schema } from "mongoose";
import UserModel from "../models/users.js";
// import MiningAreaModel from "../models/mining_areas.js";
// import ProductModel from "../models/products.js";
import CommunityProductModel from "../models/community_products.js";
import { validateToken } from "../middlewares/auth.js";
import { inventoryStatus, communityProductStatus } from "../utils/enums.js";

const app = express();

app.get("/api/community/sale-items", [validateToken], async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const searchRegex = new RegExp(search, 'i'); 

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

export default app;
