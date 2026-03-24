import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: [50, "Name must be at most 50 characters"],
            minLength: [3, "Name must be at least 3 characters"],
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxLength: [500, "Description must be at most 500 characters"],
            minLength: [10, "Description must be at least 10 characters"],
        },
        price: {
            type: Number,
            required: true,
            min: [0, "Price must be >= 0"],
        },
        category: {
            type: String,
            required: true,
            trim: true,
            maxLength: [50, "Category must be at most 50 characters"],
            minLength: [3, "Category must be at least 3 characters"],
        },
        images: {
            type: [String],
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            min: [0, "Stock must be >= 0"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
