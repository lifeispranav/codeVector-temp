import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/product_api';
        await mongoose.connect(uri);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;
