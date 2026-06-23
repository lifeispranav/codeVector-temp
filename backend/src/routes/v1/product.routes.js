import { Router } from 'express';
import { getProducts } from '../../controllers/product.controller.js';
import { validate } from '../../validation/validate.middleware.js';
import { getProductsSchema } from '../../validation/product.validation.js';

const router = Router();

// GET /api/v1/products
router.get('/', validate(getProductsSchema), getProducts);

export default router;
