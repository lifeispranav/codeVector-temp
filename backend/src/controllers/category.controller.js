import { ProductService } from '../services/product.service.js';
import { catchAsync } from '../utils/catchAsync.js';

const productService = new ProductService();

export const getCategories = catchAsync(async (req, res) => {
    const categories = await productService.getCategories();

    res.status(200).json({
        status: 'success',
        data: {
            categories
        }
    });
});
