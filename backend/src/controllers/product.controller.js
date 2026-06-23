import { ProductService } from '../services/product.service.js';
import { catchAsync } from '../utils/catchAsync.js';

const productService = new ProductService();

export const getProducts = catchAsync(async (req, res) => {
    const { category, cursor, limit, search, sort } = req.query;

    const parsedLimit = limit ? parseInt(limit, 10) : 50;

    const result = await productService.getProducts(category, cursor, parsedLimit, search, sort);

    res.status(200).json({
        status: 'success',
        data: result
    });
});
