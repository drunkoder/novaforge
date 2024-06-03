import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import UserModel from '../models/users.js';
import ProductModel from '../models/products.js';
import MiningAreaModel from '../models/mining_areas.js';
import MiningAreaProductModel from '../models/mining_area_products.js';
import userRoles from '../utils/enums.js';
import connectDB from '../config/db.js';
import { generatePassword } from '../utils/index.js';

connectDB();

const createAdminUser = async () => {
    try {
        // Check if an admin user already exists
        const existingAdmin = await UserModel.findOne({ role: userRoles.ADMIN });
        if (existingAdmin) {
            console.log("Admin user already exists.");
            return;
        }

        // Create a new admin user
        const hashedPassword = await generatePassword('admin@123');
        const adminUser = new UserModel({
            email: 'admin@example.org',
            first_name: 'Administrator',
            password: hashedPassword,
            role: userRoles.ADMIN
        });
        await adminUser.save();
        console.log("Admin user created successfully.");
    } catch (error) {
        console.error("Error creating admin user:", error);
    }
};

const createSampleMiningAreas = async () => {
    try {
        // Check if sample mining areas already exist
        const existingMiningAreas = await MiningAreaModel.find();
        if (existingMiningAreas.length > 0) {
            console.log("Sample mining areas already exist.");
            return;
        }

        // Create sample products
        const sampleProducts = [
            { code: 'PROD001', name: 'Sample Product 1', description: 'Description for Sample Product 1' },
            { code: 'PROD002', name: 'Sample Product 2', description: 'Description for Sample Product 2' },
            { code: 'PROD003', name: 'Sample Product 3', description: 'Description for Sample Product 3' }
        ];
        const createdProducts = await ProductModel.insertMany(sampleProducts);

        // Create sample mining areas with products
        const sampleMiningAreas = [
            {
                name: 'Sample Mining Area 1',
                type: 'planet',
                description: 'Description for Sample Mining Area 1',
                products: [
                    { product_id: new mongoose.Types.ObjectId(createdProducts[0]._id), price: 100, quantity: 10 },
                    { product_id: new mongoose.Types.ObjectId(createdProducts[1]._id), price: 150, quantity: 15 }
                ]
            },
            {
                name: 'Sample Mining Area 2',
                type: 'asteroid',
                description: 'Description for Sample Mining Area 2',
                products: [
                    { product_id: new mongoose.Types.ObjectId(createdProducts[1]._id), price: 200, quantity: 20 },
                    { product_id: new mongoose.Types.ObjectId(createdProducts[2]._id), price: 250, quantity: 25 }
                ]
            },
            {
                name: 'Sample Mining Area 3',
                type: 'planet',
                description: 'Description for Sample Mining Area 3',
                products: [
                    { product_id: new mongoose.Types.ObjectId(createdProducts[0]._id), price: 300, quantity: 30 },
                    { product_id: new mongoose.Types.ObjectId(createdProducts[2]._id), price: 350, quantity: 35 }
                ]
            }
        ];

        for (const sampleArea of sampleMiningAreas) {
            const area = new MiningAreaModel({
                name: sampleArea.name,
                type: sampleArea.type,
                description: sampleArea.description,
                products: sampleArea.products
            });

            const miningArea = new MiningAreaModel(area);
            await miningArea.save();

            // Create mining area products
            for (const productData of sampleArea.products) {
                console.log(productData);
                const productId = new mongoose.Types.ObjectId(productData.product_id);

                const miningAreaProduct = new MiningAreaProductModel({
                    mining_area_id: miningArea._id,
                    product_id: productId,
                    price: productData.price,
                    quantity: productData.quantity
                });
                await miningAreaProduct.save();

                miningArea.products.push(productId);
            }

            await miningArea.save();
        }

        console.log("Sample mining areas created successfully.");
    } catch (error) {
        console.error("Error creating sample mining areas:", error);
    }
};


const createSampleUser = async () => {
    try {
        // Check if an sample user already exists
        const existingUser = await UserModel.findOne({ role: userRoles.USER });
        if (existingUser) {
            console.log("User already exists.");
            return;
        }

        // Create a new user
        const hashedPassword = await generatePassword('user@123');
        const user = new UserModel({
            email: 'user@example.org',
            first_name: 'User 1',
            password: hashedPassword,
            role: userRoles.USER
        });
        await user.save();
        console.log("User created successfully.");
    } catch (error) {
        console.error("Error creating user:", error);
    }
};

const initializeDatabase = async () => {
    try {
        await createAdminUser();
        await createSampleUser();
        await createSampleMiningAreas();
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        mongoose.connection.close();
    }
};

initializeDatabase();