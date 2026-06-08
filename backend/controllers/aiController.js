import productModel from "../models/productModel.js";
import { getEmbedding, generateAssistantResponse } from "../utils/gemini.js";

/**
 * Controller to handle AI Assistant styling & shopping recommendations.
 * Recommends actual items from the store inventory based on active cart.
 */
export const getAssistantRecommendations = async (req, res) => {
  try {
    const { cartItems, messageHistory, userMessage } = req.body;

    // Fetch the full catalog of products from the DB so the assistant has actual inventory knowledge
    const catalog = await productModel.find({});

    // Call Gemini utility
    const result = await generateAssistantResponse(
      cartItems || [],
      messageHistory || [],
      userMessage || "Hello!",
      catalog
    );

    res.json({
      success: true,
      reply: result.reply,
      recommendedProductIds: result.recommendedProductIds
    });
  } catch (error) {
    console.error("Error in assistant controller:", error);
    res.json({
      success: false,
      message: error.message || "An error occurred with the AI assistant."
    });
  }
};

/**
 * Controller to backfill vector embeddings for all products currently in the database.
 * Useful when integrating embeddings into a pre-existing inventory.
 */
export const backfillProductEmbeddings = async (req, res) => {
  try {
    const products = await productModel.find({});
    let backfillCount = 0;

    for (let product of products) {
      // Check if product embedding is missing or empty
      if (!product.embedding || product.embedding.length === 0) {
        console.log(`Generating embedding for: ${product.name}`);
        const embedText = `Name: ${product.name}. Category: ${product.category} / ${product.subCategory}. Description: ${product.description}`;
        const embedding = await getEmbedding(embedText);
        
        product.embedding = embedding;
        await product.save();
        backfillCount++;
      }
    }

    res.json({
      success: true,
      message: `Successfully backfilled embeddings for ${backfillCount} products.`,
      totalProducts: products.length
    });
  } catch (error) {
    console.error("Error backfilling embeddings:", error);
    res.json({
      success: false,
      message: error.message
    });
  }
};
