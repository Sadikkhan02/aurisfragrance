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
const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
);
const data = await res.json();

if (data.error) {
  console.error("Error:", data.error.message);
  process.exit(1);
}

console.log("\n=== Available Models for Your API Key ===\n");
for (const m of data.models || []) {
  const methods = (m.supportedGenerationMethods || []).join(", ");
  console.log(`• ${m.name.replace("models/", "")}  [${methods}]`);
}
console.log("\n=========================================\n");
