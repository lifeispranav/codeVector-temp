import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    price: {
        type: Number,
        required: true
    },
    unique_id: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create index for pagination by _id, and filtering by category
productSchema.index({ category: 1, _id: -1 });
productSchema.index({ _id: -1 });
productSchema.index({ price: 1, _id: -1 });
productSchema.index({ price: -1, _id: -1 });
productSchema.index({ name: 'text' });

export const Product = mongoose.model('Product', productSchema);
