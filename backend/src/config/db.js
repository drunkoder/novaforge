import mongoose from 'mongoose';
import dotenv from "dotenv";

import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongodbConnString = `mongodb://${process.env.MONGO_INITDB_HOST}:${process.env.MONGO_INITDB_PORT}`;
console.log(mongodbConnString);

const connectDB = () => {
    mongoose
        .connect(mongodbConnString, {
            auth: {
                username: process.env.MONGO_INITDB_ROOT_USERNAME,
                password: process.env.MONGO_INITDB_ROOT_PASSWORD
            },
            dbName: process.env.MONGO_INITDB_DATABASE,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => console.log("DB Connected Successfully..."))
        .catch((error) => console.log(error));
        
};

export default connectDB;
