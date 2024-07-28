import mongoose from 'mongoose';
import dotenv from "dotenv";

import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongodbConnString = `${process.env.MONGO_INITDB_URL}`;
console.log(mongodbConnString);
console.log(process.env.MONGO_INITDB_ROOT_USERNAME);
console.log(process.env.MONGO_INITDB_ROOT_PASSWORD);

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
