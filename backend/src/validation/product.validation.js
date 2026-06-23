import { z } from 'zod';

export const getProductsSchema = z.object({
    query: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        sort: z.enum(['newest', 'price_asc', 'price_desc']).optional(),
        cursor: z.string().optional(),
        limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional().transform(val => (val ? parseInt(val, 10) : 50))
    })
});
