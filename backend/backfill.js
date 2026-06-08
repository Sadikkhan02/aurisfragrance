import mongoose from "mongoose";
import "dotenv/config";
import productModel from "./models/productModel.js";
import { getEmbedding } from "./utils/gemini.js";

const backfill = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("Error: MONGODB_URI is not set in your .env file!");
      process.exit(1);
    }
    
    console.log("Connecting to database at:", uri);
    await mongoose.connect(uri);
    console.log("Database connection successful!");

    const products = await productModel.find({});
    console.log(`Found ${products.length} products in inventory.`);

    if (products.length > 0) {
      console.log("First product in database:", JSON.stringify(products[0], null, 2));
    }

    let count = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      // Skip invalid products
      if (!product || !product.name) {
        console.warn(`[${i + 1}/${products.length}] Warning: Product at index ${i} is missing name field.`);
        continue;
      }
      // Generate vector embedding if not already populated or if placeholder
      if (!product.embedding || product.embedding.length === 0) {
        console.log(`[${i + 1}/${products.length}] Generating embedding for: ${product.name}`);
        const embedText = `Name: ${product.name}. Category: ${product.category} / ${product.subCategory}. Description: ${product.description}`;
        
        const embedding = await getEmbedding(embedText);
        product.embedding = embedding;
        await product.save();
        count++;
      } else {
        console.log(`[${i + 1}/${products.length}] Embedding already exists for: ${product.name}`);
      }
    }

    console.log(`\nBackfill process finished.`);
    console.log(`Generated embeddings for ${count} products.`);
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Backfill failed with error:", error);
    process.exit(1);
  }
};

backfill();
