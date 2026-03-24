import { Product } from "../models/product.model.js";

const requiredFields = ["name", "description", "price", "category", "images", "stock"];

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, images, stock } = req.body;
        const missing = requiredFields.filter((k) => req.body[k] === undefined || req.body[k] === null);
        if (missing.length) {
            return res.status(400).json({
                success: false,
                message: `Missing: ${missing.join(", ")}`,
            });
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            images,
            stock,
        });

        return res.status(201).json({
            success: true,
            message: "Product created",
            data: product,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

function buildListFilter(query) {
    const filter = {};
    if (query.category) filter.category = query.category;
    if (query.isActive === "true") filter.isActive = true;
    if (query.isActive === "false") filter.isActive = false;

    const search = typeof query.search === "string" ? query.search.trim() : "";
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    const minP = query.minPrice !== undefined && query.minPrice !== "" ? Number(query.minPrice) : null;
    const maxP = query.maxPrice !== undefined && query.maxPrice !== "" ? Number(query.maxPrice) : null;
    if (minP != null && !Number.isNaN(minP)) {
        filter.price = { ...filter.price, $gte: minP };
    }
    if (maxP != null && !Number.isNaN(maxP)) {
        filter.price = { ...filter.price, $lte: maxP };
    }

    return filter;
}

function listSort(query) {
    switch (query.sort) {
        case "price-asc":
            return { price: 1 };
        case "price-desc":
            return { price: -1 };
        case "name":
            return { name: 1 };
        default:
            return { createdAt: -1 };
    }
}

export const getProductsMeta = async (req, res) => {
    try {
        const categories = await Product.distinct("category");
        const bounds = await Product.aggregate([
            { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
        ]);
        const row = bounds[0] || { min: 0, max: 0 };
        const totalItems = await Product.countDocuments({});

        return res.status(200).json({
            success: true,
            data: {
                categories: categories.sort(),
                priceMin: row.min ?? 0,
                priceMax: row.max ?? 0,
                totalItems,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 12));
        const skip = (page - 1) * limit;

        const filter = buildListFilter(req.query);
        const sort = listSort(req.query);

        const [totalItems, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        ]);

        const totalPages = Math.max(1, Math.ceil(totalItems / limit));

        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        return res.status(200).json({ success: true, data: product });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid product id",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};
