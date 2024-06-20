import express from "express";
import controller from "./src/controller/controller.js";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import swaggerRouter from './swagger.js';

dotenv.config();

const app = express();
const port = 3000;
//const connectDB = require("./config/db");

connectDB();

// const umzug = require('umzug');

// const mongodbConnString = `mongodb://${process.env.MONGO_INITDB_HOST}:${process.env.MONGO_INITDB_PORT}`;
// const migrator = umzug({
//   migrations: { glob: 'backend/migrations/*.js' },
//   uri: mongodbConnString,
//   dbName: 'novaforge',
//   collections: 'migrations'
// });

// // Run migrations before starting the server
// migrator.up().then(() => {
//   console.log('Migrations applied successfully');
// }).catch((err) => {
//   console.error('Migration error:', err);
// });

// const mongodbConnString = `mongodb://${process.env.MONGO_INITDB_HOST}:${process.env.MONGO_INITDB_PORT}`;
// console.log(mongodbConnString);

// mongoose.connect(mongodbConnString, {
//     user: process.env.MONGO_INITDB_ROOT_USERNAME,
//     pass: process.env.MONGO_INITDB_ROOT_PASSWORD,
//     dbName: process.env.MONGO_INITDB_DATABASE,
//   })
//   .then(() => {
//     console.log("Database connected");
//   })
//   .catch((err) => {
//     console.error(err);
//   });

// const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

  



app.use('/', swaggerRouter);
app.use(cors());
app.use(express.json());
app.use(controller);
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});