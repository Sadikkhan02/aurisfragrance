import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, ".env"), "utf8");
for (const line of envContent.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const [k, ...v] = t.split("=");
  process.env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
}

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

console.log("\n========================================");
console.log("   Final Gemini Verification Test");
console.log("========================================\n");
console.log("Key: " + API_KEY.slice(0, 8) + "..." + API_KEY.slice(-4) + "\n");

// ── Test 1: Embedding ─────────────────────────────────────────────────────
console.log("Test 1: Embedding (gemini-embedding-001)");
try {
  const m = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const r = await m.embedContent("Luxury oud perfume for men");
  const vec = r?.embedding?.values;
  if (vec && vec.length > 0) {
    console.log("  PASS - vector length: " + vec.length);
    console.log("  First 5 values: " + vec.slice(0, 5).map(v => v.toFixed(5)).join(", "));
  } else {
    console.log("  FAIL - no values returned");
  }
} catch (e) {
  console.log("  FAIL - " + e.message.split("\n")[0]);
}

// ── Test 2: Chat ──────────────────────────────────────────────────────────
console.log("\nTest 2: Chat Assistant (gemini-2.0-flash)");
try {
  const m = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const r = await m.generateContent(
    'You are a fragrance assistant. Reply ONLY with valid JSON: {"reply":"your advice","recommendedProductIds":[]}'
  );
  const text = r.response.text();
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    console.log("  PASS - reply: " + parsed.reply?.slice(0, 120));
  } catch {
    console.log("  PASS (plain text) - " + text.slice(0, 120));
  }
} catch (e) {
  console.log("  FAIL - " + e.message.split("\n")[0]);
}

console.log("\n========================================");
console.log("   Test Complete");
console.log("========================================\n");
