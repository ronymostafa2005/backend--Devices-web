import { Router } from "express";
import {
    createProduct,
    getProducts,
    getProductsMeta,
    getProductById,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/meta/summary", getProductsMeta);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);

export default router;
