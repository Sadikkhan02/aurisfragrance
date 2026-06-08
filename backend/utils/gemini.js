import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate 768-dimensional embedding vector for a given text.
 * Falls back to mock array if GEMINI_API_KEY is not set.
 */
export const getEmbedding = async (text) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in backend/.env. Returning mock embedding vector.");
      return generateMockEmbedding(text);
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(text);
    if (result && result.embedding && result.embedding.values) {
      return result.embedding.values;
    }
    return generateMockEmbedding(text);
  } catch (error) {
    console.error("Error generating embedding from Gemini API:", error.message);
    return generateMockEmbedding(text);
  }
};

/**
 * Computes cosine similarity between two vectors.
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Uses gemini-1.5-flash to chat with the shopping assistant, recommending products based on cart context and search queries.
 */
export const generateAssistantResponse = async (cartItems, messageHistory, userMessage, catalog) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        reply: "Hello! Welcome to Auris Fragrance. (Note: GEMINI_API_KEY is missing from backend/.env, so I am running in local fallback mode. Please configure the key to connect to my brain!)",
        recommendedProductIds: catalog.slice(0, 3).map(p => p._id)
      };
    }

    // 1. Build catalog & system instruction first
    const catalogSummary = catalog.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price,
      category: p.category,
      subCategory: p.subCategory,
      bestseller: p.bestSeller ? "Yes" : "No",
      description: p.description
    }));

    const systemInstruction = `You are "Auris AI Assistant", an expert personal fashion stylist and shopping assistant for the "Auris Fragrance" e-commerce store (which sells premium clothing items for Men, Women, and Kids).

Your goal is to guide the user, offer styling advice, and make product recommendations based on their query and current shopping cart.

Available Store Inventory Catalog:
${JSON.stringify(catalogSummary, null, 2)}

User's Current Cart Items:
${JSON.stringify(cartItems, null, 2)}

Instructions:
1. Provide a direct, friendly, and helpful response. Be concise (2-4 sentences). Suggest specific companion or matching items from the Store Inventory Catalog (e.g. if they have a jacket, suggest pants or a t-shirt; if they are browsing, suggest bestselling items).
2. Explain briefly why these items go together.
3. You must respond with a JSON object containing the exact properties:
{
  "reply": "Your written advice and recommendation response here.",
  "recommendedProductIds": ["id1", "id2"]
}
4. The recommendedProductIds array MUST only contain valid IDs from the Store Inventory Catalog. Limit this to at most 3 IDs.
5. If the user asks general questions or styles, respond in character as a fashion expert and suggest relevant items.`;

    // 2. Create model with systemInstruction embedded
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemInstruction,
      generationConfig: { responseMimeType: "application/json" }
    });

    // 3. Build safe history (must start with 'user', no blank entries)
    const mappedHistory = (messageHistory || [])
      .map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text || "" }]
      }))
      .filter(m => m.parts[0].text.trim() !== "");

    const firstUserIndex = mappedHistory.findIndex(m => m.role === "user");
    const safeHistory = firstUserIndex >= 0 ? mappedHistory.slice(firstUserIndex) : [];

    // 4. Use generateContent instead of startChat — avoids all history validation issues
    const contents = [
      ...safeHistory,
      { role: "user", parts: [{ text: userMessage || "Hello!" }] }
    ];

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();

    try {
      const parsed = JSON.parse(responseText);
      return {
        reply: parsed.reply || responseText,
        recommendedProductIds: parsed.recommendedProductIds || []
      };
    } catch (err) {
      console.warn("Failed to parse AI response as JSON. Returning plain text response.", err);
      return {
        reply: responseText,
        recommendedProductIds: []
      };
    }
  } catch (error) {
    console.error("Error generating assistant chat response:", error);
    return {
      reply: "I apologize, but I encountered an error while trying to generate advice. Please try again in a moment!",
      recommendedProductIds: []
    };
  }
};

/**
 * Generate a deterministic mock vector of length 768 based on input string
 * so we can fallback gracefully without breaking the database query.
 */
function generateMockEmbedding(text) {
  const embedding = new Array(768).fill(0);
  const str = text || "default";
  
  // Seed a simple LCG random number generator based on hash code of text
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let seed = Math.abs(hash) || 1;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  
  for (let i = 0; i < 768; i++) {
    embedding[i] = lcg() - 0.5;
  }
  
  // Normalize vector
  let norm = 0;
  for (let i = 0; i < 768; i++) norm += embedding[i] * embedding[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < 768; i++) embedding[i] /= norm;
  }
  
  return embedding;
}
