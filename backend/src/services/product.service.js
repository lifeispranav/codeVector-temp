import { ProductRepository } from '../repositories/product.repository.js';
import AppError from '../utils/AppError.js';

const productRepository = new ProductRepository();

export class ProductService {
    async getProducts(category, cursor, limit = 50, search, sort) {
        const products = await productRepository.findProducts({ category, cursor, limit, search, sort });
        
        // Determine the next cursor
        let nextCursor = null;
        if (products.length === limit) {
            const lastProduct = products[products.length - 1];
            if (sort === 'price_asc' || sort === 'price_desc') {
                nextCursor = `${lastProduct.price}_${lastProduct._id}`;
            } else {
                nextCursor = lastProduct._id;
            }
        }

        return {
            products,
            nextCursor
        };
    }

    async getCategories() {
        return await productRepository.getCategories();
    }
}
