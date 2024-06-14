import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import UserModel from '../models/users.js';
import ProductModel from '../models/products.js';
import MiningAreaModel from '../models/mining_areas.js';
import ExchangeRateModel from '../models/exchange_rates.js';
import { userRoles } from '../utils/enums.js';
import connectDB from '../config/db.js';
import { generatePassword } from '../utils/index.js';

connectDB();

const planetImages = {
    Mercury: '2k_mercury.jpg',
    Venus: '2k_venus.jpg',
    Earth: '2k_earth_.jpg',
    Mars: '2k_mars.jpg',
    Jupiter: '2k_jupiter.jpg',
    Saturn: '2k_saturn.jpg',
    Uranus: '2k_uranus.jpg',
    Neptune: '2k_neptune.jpg'
};

const getRandomPlanetImage = () => {
    const planets = Object.keys(planetImages);
    const randomPlanet = planets[Math.floor(Math.random() * planets.length)];
    return planetImages[randomPlanet];
};

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
            role: userRoles.ADMIN,
            purchased_products: []
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
            { code: 'GOLD', name: 'Gold', description: 'Pure gold extracted from asteroids.' },
            { code: 'SILVER', name: 'Silver', description: 'High-quality silver from lunar mining.' },
            { code: 'PLATINUM', name: 'Platinum', description: 'Rare platinum metals found in outer belt asteroids.' },
            { code: 'DIAMOND', name: 'Diamond', description: 'Flawless diamonds mined from Martian soil.' },
            { code: 'COPPER', name: 'Copper', description: 'Industrial-grade copper for spacecraft construction.' },
            { code: 'IRON', name: 'Iron', description: 'High-purity iron ore from asteroid mines.' },
            { code: 'NICKEL', name: 'Nickel', description: 'Nickel alloy for spacecraft components.' },
            { code: 'TITANIUM', name: 'Titanium', description: 'Titanium alloy for space station construction.' },
            { code: 'URANIUM', name: 'Uranium', description: 'Highly enriched uranium for power generation.' },
            { code: 'ALUMINUM', name: 'Aluminum', description: 'Lightweight aluminum for spacecraft frames.' }
        ];
        const createdProducts = await ProductModel.insertMany(sampleProducts);

        // Create sample mining areas with products
        const sampleMiningAreas = [
            {
                name: 'Asteroid Mining Site Alpha',
                type: 'Asteroid',
                description: 'Prime asteroid belt location for mineral extraction.',
                image: getRandomPlanetImage(),
                products: [
                    { product_id: createdProducts[0]._id, price: 100, quantity: 10 },
                    { product_id: createdProducts[1]._id, price: 150, quantity: 15 },
                    { product_id: createdProducts[2]._id, price: 120, quantity: 20 }
                ]
            },
            {
                name: 'Lunar Mining Base Omega',
                type: 'Moon',
                description: 'State-of-the-art facility on the lunar surface for rare metal extraction.',
                image: getRandomPlanetImage(),
                products: [
                    { product_id: createdProducts[3]._id, price: 200, quantity: 20 },
                    { product_id: createdProducts[4]._id, price: 250, quantity: 25 },
                    { product_id: createdProducts[5]._id, price: 180, quantity: 30 }
                ]
            },
            {
                name: 'Martian Mining Outpost Delta',
                type: 'Planet',
                description: 'Remote outpost on Mars for harvesting valuable minerals.',
                image: getRandomPlanetImage(),
                products: [
                    { product_id: createdProducts[6]._id, price: 220, quantity: 22 },
                    { product_id: createdProducts[7]._id, price: 270, quantity: 27 },
                    { product_id: createdProducts[8]._id, price: 190, quantity: 32 }
                ]
            },
            {
                name: 'Europa Ice Mining Station Gamma',
                type: 'Moon',
                description: 'Subsurface ice mining station on Jupiter\'s moon Europa.',
                image: getRandomPlanetImage(),
                products: [
                    { product_id: createdProducts[9]._id, price: 150, quantity: 15 },
                    { product_id: createdProducts[1]._id, price: 180, quantity: 18 },
                    { product_id: createdProducts[3]._id, price: 200, quantity: 20 }
                ]
            },
            {
                name: 'Kuiper Belt Mining Facility Epsilon',
                type: 'Asteroid',
                description: 'Advanced mining facility located in the Kuiper Belt for rare elements.',
                image: getRandomPlanetImage(),
                products: [
                    { product_id: createdProducts[4]._id, price: 170, quantity: 17 },
                    { product_id: createdProducts[5]._id, price: 200, quantity: 20 },
                    { product_id: createdProducts[6]._id, price: 230, quantity: 23 }
                ]
            },
            {
                name: 'Mercury Mining Outpost Theta',
                type: 'Planet',
                description: 'Outpost on Mercury\'s surface for heat-resistant mineral extraction.',
                image: getRandomPlanetImage(),
                products: [
                    { product_id: createdProducts[7]._id, price: 190, quantity: 19 },
                    { product_id: createdProducts[8]._id, price: 220, quantity: 22 },
                    { product_id: createdProducts[9]._id, price: 240, quantity: 24 }
                ]
            },
            {
                name: 'Venus Cloud Mining Platform Zeta',
                type: 'Planet',
                description: 'Floating platform in Venus\'s atmosphere for cloud mining operations.',
                image: getRandomPlanetImage(),
                products: [
                    { product_id: createdProducts[0]._id, price: 160, quantity: 16 },
                    { product_id: createdProducts[2]._id, price: 190, quantity: 19 },
                    { product_id: createdProducts[4]._id, price: 210, quantity: 21 }
                ]
            },
            {
                name: 'Phobos Regolith Mining Facility Sigma',
                type: 'Moon',
                description: 'Base on Mars\'s moon Phobos for regolith mining.',
                image: getRandomPlanetImage(),
                products: [
                    { product_id: createdProducts[1]._id, price: 200, quantity: 20 },
                    { product_id: createdProducts[3]._id, price: 230, quantity: 23 },
                    { product_id: createdProducts[5]._id, price: 250, quantity: 25 }
                ]
            },
            {
                name: 'Deimos Ice Mining Outpost Kappa',
                type: 'Moon',
                description: 'Outpost on Mars\'s moon Deimos for ice mining operations.',
                image: getRandomPlanetImage(),
                products: [
                    { product_id: createdProducts[6]._id, price: 170, quantity: 17 },
                    { product_id: createdProducts[8]._id, price: 200, quantity: 20 },
                    { product_id: createdProducts[0]._id, price: 220, quantity: 22 }
                ]
            },
            {
                name: 'Oort Cloud Prospecting Station Omega',
                type: 'Asteroid',
                description: 'Remote station in the Oort Cloud for prospecting comet nuclei.',
                image: getRandomPlanetImage(),
                products: [
                    { product_id: createdProducts[2]._id, price: 180, quantity: 18 },
                    { product_id: createdProducts[4]._id, price: 210, quantity: 21 },
                    { product_id: createdProducts[6]._id, price: 240, quantity: 24 }
                ]
            }
        ];

        for (const sampleArea of sampleMiningAreas) {
            const area = new MiningAreaModel({
                name: sampleArea.name,
                type: sampleArea.type,
                description: sampleArea.description,
                image: sampleArea.image,
                products: sampleArea.products
            });

            const miningArea = new MiningAreaModel(area);
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
            role: userRoles.USER,
            purchased_products: []
        });

        const miningAreas = await MiningAreaModel.find();

        const purchasedProducts = [
            {
                product_id: miningAreas[0].products[0].product_id,
                mining_area_id: miningAreas[0]._id,
                price: miningAreas[0].products[0].price,
                quantity: 2,
                status: 'AVAILABLE'
            },
            {
                product_id: miningAreas[1].products[1].product_id,
                mining_area_id: miningAreas[1]._id,
                price: miningAreas[1].products[1].price,
                quantity: 3,
                status: 'SOLD'
            },
            {
                product_id: miningAreas[2].products[0].product_id,
                mining_area_id: miningAreas[2]._id,
                price: miningAreas[2].products[0].price,
                quantity: 1,
                status: 'FOR_SALE'
            }
        ];

        user.purchased_products = purchasedProducts;
        await user.save();
        console.log("User created successfully.");
    } catch (error) {
        console.error("Error creating user:", error);
    }
};

const createSampleUsers = async () => {
    try {
        // Check if sample users already exist
        const existingUsers = await UserModel.find({ role: userRoles.USER });
        if (existingUsers.length >= 5) {
            console.log("Sample users already exist.");
            return;
        }

        // Retrieve mining areas
        const miningAreas = await MiningAreaModel.find();

        // Create sample users
        const sampleUsers = [
            {
                email: 'user1@example.org',
                first_name: 'John',
                password: 'user1@123',
                role: userRoles.USER,
                purchased_products: [
                    { product_id: miningAreas[0].products[0].product_id, mining_area_id: miningAreas[0]._id, price: 100, quantity: 2, status: 'AVAILABLE' },
                    { product_id: miningAreas[0].products[1].product_id, mining_area_id: miningAreas[0]._id, price: 150, quantity: 3, status: 'SOLD' },
                    { product_id: miningAreas[1].products[0].product_id, mining_area_id: miningAreas[1]._id, price: 200, quantity: 1, status: 'FOR_SALE' },
                    { product_id: miningAreas[1].products[1].product_id, mining_area_id: miningAreas[1]._id, price: 250, quantity: 4, status: 'SOLD' },
                    { product_id: miningAreas[2].products[0].product_id, mining_area_id: miningAreas[2]._id, price: 300, quantity: 2, status: 'AVAILABLE' }
                ]
            },
            {
                email: 'user2@example.org',
                first_name: 'Alice',
                password: 'user2@123',
                role: userRoles.USER,
                purchased_products: [
                    { product_id: miningAreas[0].products[1].product_id, mining_area_id: miningAreas[0]._id, price: 150, quantity: 3, status: 'SOLD' },
                    { product_id: miningAreas[1].products[0].product_id, mining_area_id: miningAreas[1]._id, price: 200, quantity: 1, status: 'FOR_SALE' },
                    { product_id: miningAreas[2].products[1].product_id, mining_area_id: miningAreas[2]._id, price: 250, quantity: 4, status: 'SOLD' },
                    { product_id: miningAreas[3].products[0].product_id, mining_area_id: miningAreas[3]._id, price: 300, quantity: 2, status: 'AVAILABLE' },
                    { product_id: miningAreas[4].products[0].product_id, mining_area_id: miningAreas[4]._id, price: 350, quantity: 3, status: 'SOLD' }
                ]
            },
            {
                email: 'user3@example.org',
                first_name: 'Bob',
                password: 'user3@123',
                role: userRoles.USER,
                purchased_products: [
                    { product_id: miningAreas[1].products[1].product_id, mining_area_id: miningAreas[1]._id, price: 250, quantity: 4, status: 'SOLD' },
                    { product_id: miningAreas[2].products[0].product_id, mining_area_id: miningAreas[2]._id, price: 300, quantity: 2, status: 'AVAILABLE' },
                    { product_id: miningAreas[3].products[1].product_id, mining_area_id: miningAreas[3]._id, price: 350, quantity: 3, status: 'SOLD' },
                    { product_id: miningAreas[4].products[1].product_id, mining_area_id: miningAreas[4]._id, price: 400, quantity: 1, status: 'FOR_SALE' },
                    { product_id: miningAreas[5].products[0].product_id, mining_area_id: miningAreas[5]._id, price: 450, quantity: 2, status: 'AVAILABLE' }
                ]
            },
            {
                email: 'user4@example.org',
                first_name: 'Emily',
                password: 'user4@123',
                role: userRoles.USER,
                purchased_products: [
                    { product_id: miningAreas[2].products[1].product_id, mining_area_id: miningAreas[2]._id, price: 300, quantity: 2, status: 'AVAILABLE' },
                    { product_id: miningAreas[3].products[0].product_id, mining_area_id: miningAreas[3]._id, price: 350, quantity: 3, status: 'SOLD' },
                    { product_id: miningAreas[4].products[0].product_id, mining_area_id: miningAreas[4]._id, price: 400, quantity: 1, status: 'FOR_SALE' },
                    { product_id: miningAreas[5].products[1].product_id, mining_area_id: miningAreas[5]._id, price: 450, quantity: 2, status: 'AVAILABLE' },
                    { product_id: miningAreas[6].products[0].product_id, mining_area_id: miningAreas[6]._id, price: 500, quantity: 3, status: 'SOLD' }
                ]
            },
            {
                email: 'user5@example.org',
                first_name: 'David',
                password: 'user5@123',
                role: userRoles.USER,
                purchased_products: [
                    { product_id: miningAreas[3].products[1].product_id, mining_area_id: miningAreas[3]._id, price: 350, quantity: 3, status: 'SOLD' },
                    { product_id: miningAreas[4].products[0].product_id, mining_area_id: miningAreas[4]._id, price: 400, quantity: 1, status: 'FOR_SALE' },
                    { product_id: miningAreas[5].products[1].product_id, mining_area_id: miningAreas[5]._id, price: 450, quantity: 2, status: 'AVAILABLE' },
                    { product_id: miningAreas[6].products[0].product_id, mining_area_id: miningAreas[6]._id, price: 500, quantity: 3, status: 'SOLD' },
                    { product_id: miningAreas[7].products[1].product_id, mining_area_id: miningAreas[7]._id, price: 550, quantity: 1, status: 'FOR_SALE' }
                ]
            }
        ];

        for (const userData of sampleUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            delete userData.password;
            userData.password = hashedPassword;
            const user = new UserModel(userData);
            await user.save();
        }

        console.log("Sample users created successfully.");
    } catch (error) {
        console.error("Error creating sample users:", error);
    }
};



const createExchangeRates = async () => {
    try {
      const existingRates = await ExchangeRateModel.find();
      if (existingRates.length > 0) {
        console.log("Exchange rates already exist.");
        return;
      }
  
      // sample exchange rates
      const sampleExchangeRates = [
        { country_name: 'United States', code: 'USD', coins: 1.0 },
        { country_name: 'Europe', code: 'EUR', coins: 0.84 },
        { country_name: 'United Kingdom', code: 'GBP', coins: 0.72 },
        { country_name: 'Japan', code: 'JPY', coins: 109.53 },
        { country_name: 'Switzerland', code: 'CHF', coins: 0.92 },
        { country_name: 'Canada', code: 'CAD', coins: 1.21 },
        { country_name: 'Australia', code: 'AUD', coins: 1.29 },
        { country_name: 'China', code: 'CNY', coins: 6.42 },
        { country_name: 'India', code: 'INR', coins: 72.89 },
        { country_name: 'Brazil', code: 'BRL', coins: 5.06 },
        { country_name: 'Russia', code: 'RUB', coins: 73.43 },
        { country_name: 'South Korea', code: 'KRW', coins: 1125.47 },
        { country_name: 'Mexico', code: 'MXN', coins: 19.91 },
        { country_name: 'Turkey', code: 'TRY', coins: 8.50 },
        { country_name: 'Indonesia', code: 'IDR', coins: 14345.95 },
        { country_name: 'South Africa', code: 'ZAR', coins: 14.44 },
        { country_name: 'Saudi Arabia', code: 'SAR', coins: 3.75 },
        { country_name: 'Nigeria', code: 'NGN', coins: 411.51 },
        { country_name: 'Argentina', code: 'ARS', coins: 95.96 },
        { country_name: 'Egypt', code: 'EGP', coins: 15.69 }
      ];
  
      await ExchangeRateModel.insertMany(sampleExchangeRates);
      console.log("Sample exchange rates created successfully.");
    } catch (error) {
      console.error("Error creating sample exchange rates:", error);
    }
  };

  
const initializeDatabase = async () => {
    try {
        await createSampleMiningAreas();
        await createExchangeRates();
        await createAdminUser();
        await createSampleUser();
        await createSampleUsers();
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        mongoose.connection.close();
    }
};

initializeDatabase();
