import express from "express";
import UserModel from "../models/users.js";
// import MiningAreaModel from "../models/mining_areas.js";
// import ProductModel from "../models/products.js";
// import { validateToken } from "../middlewares/auth.js";
import { inventoryStatus } from "../utils/enums.js";

const app = express();

app.get('/api/market/sale-items', async (req, res) => {
  try {
    console.log(req.query);
    const { page = 1, limit = 10, search = '', miningAreaId = '', sortBy } = req.query;

    const count = parseInt(limit);
    const skip = (parseInt(page) - 1) * count;
        

    const searchRegex = search ? new RegExp(search, 'i') : null;

    let searchConditions = {
      'purchased_products.status': inventoryStatus.FOR_SALE
    };

    if (search) {
      searchConditions.$or = [
        { 'first_name': searchRegex },
        { 'last_name': searchRegex },
        { 'purchased_products.mining_area_id': { $exists: true, $ne: null } },
        { 'purchased_products.product_id': { $exists: true, $ne: null } },
        //{ 'purchased_products.mining_area_id.name': searchRegex },
        //{ 'purchased_products.product_id.name': searchRegex }
      ];
    }

    // All purchased_products with FOR_SALE status mean the items are to be sold
    const usersWithForSaleProducts = await UserModel.find(searchConditions)
                                                    .populate({
                                                      path: 'purchased_products',
                                                      //match: { status: 'FOR_SALE' },
                                                      populate: [
                                                        {
                                                          path: 'mining_area_id',
                                                          model: 'mining_areas',
                                                          select: 'name'
                                                        },
                                                        {
                                                          path: 'product_id',
                                                          model: 'products',
                                                          select: 'name'
                                                        }
                                                      ]
                                                    });

    let forSaleProducts = [];

    //console.log(usersWithForSaleProducts);
    for (const user of usersWithForSaleProducts) {
      for (const purchase of user.purchased_products) {
        if (purchase.mining_area_id && purchase.product_id) {
          const miningAreaName = purchase.mining_area_id.name;
          const productName = purchase.product_id.name;
    
          if (!searchRegex || miningAreaName.match(searchRegex) || productName.match(searchRegex)) {
            forSaleProducts.push({
              user_id: user._id,
              full_name: `${user.first_name} ${user.last_name}`,
              mining_area_name: miningAreaName,
              product_name: productName,
              quantity: purchase.quantity
            });
          }
        }
      }
    }

    //console.log(forSaleProducts);
    const paginatedProducts = forSaleProducts.slice(skip, skip + count);

    const totalItems = forSaleProducts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;

    res.json({
      totalItems,
      totalPages,
      currentPage,
      products: paginatedProducts
    });
  } catch (error) {
    console.error('Error fetching for sale products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

    // Gets all items for sale
  //   app.get("/api/market/sale-items", validateToken, async (req, res) => {
  //       try {
  //           const { page = 1, limit = 10, search = '', miningAreaId = '', sortBy } = req.query;
  //           const skip = (parseInt(page) - 1) * parseInt(limit);
            
  //           let matchQuery = {
  //             "purchased_products.status": inventoryStatus.FOR_SALE
  //           };
        
  //           if (search) {
  //             const miningAreaIds = await findMiningAreasByNameOrDescription(search);
  //             const productIds = await findProductsByNameOrDescription(search);
        
  //             const orConditions = [];
  //             if (miningAreaIds.length > 0) {
  //               orConditions.push({ "purchased_products.mining_area_id": { $in: miningAreaIds } });
  //             }
  //             if (productIds.length > 0) {
  //               orConditions.push({ "purchased_products.product_id": { $in: productIds } });
  //             }
        
  //             matchQuery.$or = orConditions;
  //           }
        
  //           // Optionally filter by miningAreaId
  //           if (miningAreaId) {
  //             matchQuery["purchased_products.mining_area_id"] = miningAreaId;
  //           }
        
  //           // Aggregate pipeline
  //           const pipeline = [
  //             { $match: matchQuery },
  //             { $unwind: "$purchased_products" },
  //             { $match: { "purchased_products.status": inventoryStatus.FOR_SALE } },
  //             {
  //               $lookup: {
  //                 from: "products",
  //                 localField: "purchased_products.product_id",
  //                 foreignField: "_id",
  //                 as: "product"
  //               }
  //             },
  //             {
  //               $lookup: {
  //                 from: "mining_areas",
  //                 localField: "purchased_products.mining_area_id",
  //                 foreignField: "_id",
  //                 as: "mining_area"
  //               }
  //             },
  //             {
  //               $addFields: {
  //                 product: { $arrayElemAt: ["$product", 0] },
  //                 mining_area: { $arrayElemAt: ["$mining_area", 0] }
  //               }
  //             },
  //             // Filtering out records where product or mining area is null (not found)
  //             { $match: { $or: [{ product: { $exists: true } }, { mining_area: { $exists: true } }] } },
  //             {
  //               $sort: (() => {
  //                 const sortCriteria = sortBy || 'purchased_products.purchase_date';
  //                 return { [`purchased_products.${sortCriteria}`]: 1 };
  //               })()
  //             },
  //             {
  //               $skip: skip
  //             },
  //             {
  //               $limit: parseInt(limit)
  //             },
  //             {
  //               $project: {
  //                 _id: 0,
  //                 mining_area_id: "$mining_area._id",
  //                 mining_area_name: "$mining_area.name",
  //                 mining_area_description: "$mining_area.description",
  //                 mining_area_image: "$mining_area.image",
  //                 product_id: "$product._id",
  //                 product_name: "$product.name",
  //                 product_description: "$product.description",
  //                 product_image: "$product.image",
  //                 email: 1,
  //                 first_name: 1,
  //                 last_name: 1,
  //                 quantity: "$purchased_products.quantity"
  //               }
  //             }
  //           ];
        
  //            // Perform aggregation using UserModel
  //           const totalDocuments = await UserModel.aggregate(pipeline).exec();

  //           // Calculate total pages for pagination
  //           const totalItems = totalDocuments.length;
  //           const totalPages = Math.ceil(totalItems / parseInt(limit));
        
  //           return res.status(200).json({
  //             items: totalDocuments,
  //             totalPages,
  //             currentPage: parseInt(page),
  //             totalItems
  //           });
  //         } catch (error) {
  //           console.error("Error retrieving sale items:", error);
  //           return res.status(500).json({
  //             error: "Database error",
  //             message: error.message
  //           });
  //         }
  // });
  
  // async function findMiningAreasByNameOrDescription(search) {
  //   try {
  //     const regex = new RegExp(search, 'i');
  //     const miningAreas = await MiningAreaModel.find({
  //       $or: [
  //         { name: { $regex: regex } },
  //         { description: { $regex: regex } }
  //       ]
  //     }).select('_id');
  //     return miningAreas.map(area => area._id);
  //   } catch (error) {
  //     console.error("Error finding mining areas:", error);
  //     return []; 
  //   }
  // }
  
  // async function findProductsByNameOrDescription(search) {
  //   try {
  //     const regex = new RegExp(search, 'i');
  //     const products = await ProductModel.find({
  //       $or: [
  //         { name: { $regex: regex } },
  //         { description: { $regex: regex } }
  //       ]
  //     }).select('_id');
  //     return products.map(product => product._id);
  //   } catch (error) {
  //     console.error("Error finding products:", error);
  //     return [];
  //   }
  // }

export default app;
