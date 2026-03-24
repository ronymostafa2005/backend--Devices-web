/**
 * يملأ مجموعة المنتجات — افتراضيًا 1000 منتج (قابل للتعديل عبر COUNT).
 * الصور: دورة من روابط Unsplash لأجهزة إلكترونية / سمارت فقط (بدون صور عشوائية).
 * التشغيل من مجلد backend: npm run seed:products
 */
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import mongoose from "mongoose";
import { mongoUri } from "../config/database.js";
import { Product } from "../models/product.model.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, "../../.env") });

const TOTAL = Math.min(5000, Math.max(1, parseInt(process.env.SEED_PRODUCT_COUNT || "1000", 10)));
const BATCH = 250;

/** صور أجهزة إلكترونية وسمارت فقط (Unsplash) — تُعاد بالتناوب لكل المنتجات */
const ELECTRONICS_IMAGE_URLS = [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1496181137855-4086b3b0c0a8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1589492660885-5d9cb4963802?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1557324234-fc0aadb9adab?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1591290619762-fa06e09e0d08?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1590658268037-6b36369b5303?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1592899677989-48eb140bc709?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1593642632823-8f7853678796?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1611186876838-912f2e05cecb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1585298205999-d645f6a3d86b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1550009158-9c0b1310e613?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1589003077989-04ac57cbb200?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1527814050143-663f834a7a25?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606144042614-b241beee880d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1558089689-f039cec085ca?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1601784555924-9c57f3305b6b?auto=format&fit=crop&w=800&q=80",
];

const CATEGORIES = [
    "smart-devices",
    "audio",
    "smart-home",
    "wearables",
    "accessories",
    "networking",
];

const TYPES = [
    "Smart Watch",
    "5G Phone",
    "Tablet",
    "Speaker",
    "Earbuds",
    "Camera",
    "Router",
    "Power Bank",
    "Charger",
    "TV Box",
    "Sensor",
    "Hub",
];

function deviceImageForIndex(i) {
    return [ELECTRONICS_IMAGE_URLS[i % ELECTRONICS_IMAGE_URLS.length]];
}

function buildProduct(i) {
    const cat = CATEGORIES[i % CATEGORIES.length];
    const t = TYPES[i % TYPES.length];
    const n = i + 1;
    const name = `${t} ${String(n).padStart(4, "0")}`.slice(0, 50);
    const description =
        `Reliable ${t.toLowerCase()} for daily use. Catalog item ${n} with standard warranty and support.`
            .slice(0, 500)
            .padEnd(10, ".");
    const price = Math.round((9.99 + (i % 250) * 2 + (i % 11) * 0.5) * 100) / 100;

    return {
        name,
        description,
        price,
        category: cat,
        images: deviceImageForIndex(i),
        stock: (i % 200) + 1,
        isActive: true,
    };
}

const seed = async () => {
    if (!process.env.MONGODB_URI) {
        console.error("Missing MONGODB_URI in .env");
        process.exit(1);
    }

    await mongoose.connect(mongoUri());
    await Product.deleteMany({});

    let inserted = 0;
    for (let offset = 0; offset < TOTAL; offset += BATCH) {
        const size = Math.min(BATCH, TOTAL - offset);
        const chunk = Array.from({ length: size }, (_, j) => buildProduct(offset + j));
        await Product.insertMany(chunk);
        inserted += size;
        console.log(`Inserted ${inserted} / ${TOTAL}`);
    }

    console.log(`Seeded ${inserted} products.`);
    await mongoose.disconnect();
};

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
