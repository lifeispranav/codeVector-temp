import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../src/models/product.model.js';
import crypto from 'crypto';

dotenv.config();

const TOTAL_PRODUCTS = 200000;
const BATCH_SIZE = 5000;
const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Home', 'Toys', 'Sports', 'Beauty', 'Automotive', 'Grocery', 'Health'];

const generateProductsBatch = (batchSize) => {
    const products = [];
    for (let i = 0; i < batchSize; i++) {
        products.push({
            name: `Product ${crypto.randomBytes(4).toString('hex')}`,
            category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
            price: parseFloat((Math.random() * 50000).toFixed(2)),
            unique_id: crypto.randomUUID()
        });
    }
    return products;
};

const seedDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/product_api';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        console.log('Clearing existing products...');
        await Product.deleteMany({});
        console.log('Existing products cleared.');

        console.log(`Starting to seed ${TOTAL_PRODUCTS} products in batches of ${BATCH_SIZE}...`);
        const startTime = Date.now();

        for (let i = 0; i < TOTAL_PRODUCTS; i += BATCH_SIZE) {
            const batch = generateProductsBatch(BATCH_SIZE);
            await Product.insertMany(batch, { ordered: false });
            console.log(`Inserted ${i + BATCH_SIZE} / ${TOTAL_PRODUCTS} products`);
        }

        const duration = (Date.now() - startTime) / 1000;
        console.log(`Successfully seeded ${TOTAL_PRODUCTS} products in ${duration} seconds.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
