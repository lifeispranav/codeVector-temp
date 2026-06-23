import { Product } from '../models/product.model.js';

export class ProductRepository {
    async findProducts({ category, cursor, limit, search, sort }) {
        const query = {};

        if (search) {
            // Replaced $text search with $regex to support partial matching
            // The 'i' option makes it case-insensitive
            query.name = { $regex: search, $options: 'i' };
        }

        if (category) {
            query.category = category;
        }

        let sortObj = { _id: -1 };
        
        if (sort === 'price_asc') {
            sortObj = { price: 1, _id: -1 };
            if (cursor) {
                const [cursorPrice, cursorId] = cursor.split('_');
                query.$or = [
                    { price: { $gt: Number(cursorPrice) } },
                    { price: Number(cursorPrice), _id: { $lt: cursorId } }
                ];
            }
        } else if (sort === 'price_desc') {
            sortObj = { price: -1, _id: -1 };
            if (cursor) {
                const [cursorPrice, cursorId] = cursor.split('_');
                query.$or = [
                    { price: { $lt: Number(cursorPrice) } },
                    { price: Number(cursorPrice), _id: { $lt: cursorId } }
                ];
            }
        } else {
            // Default: newest
            if (cursor) {
                query._id = { $lt: cursor };
            }
        }

        const products = await Product.find(query)
            .sort(sortObj)
            .limit(limit)
            .lean();

        return products;
    }

    async getCategories() {
        return await Product.distinct('category');
    }
}
