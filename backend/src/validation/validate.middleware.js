import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';

export const validate = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });

            // If we need the validated data we could store it in req.validatedData
            // req.validatedData = result;
            
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
                return next(new AppError(`Validation failed: ${errors}`, 400));
            }
            next(error);
        }
    };
};
