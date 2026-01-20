const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List available models to debug
async function listAvailableModels() {
  try {
    const models = await genAI.listModels();
    console.log("📋 Available Models:");
    models.models.forEach(model => {
      console.log(`  - ${model.name}`);
    });
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

async function analyzeProductImage(imagePath) {
  try {
    console.log("🔍 Starting AI analysis...");
    console.log("📁 Image path:", imagePath);
    console.log("🔑 API Key exists:", !!process.env.GEMINI_API_KEY);
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("✅ Model initialized: gemini-2.5-flash");

    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
    console.log("✅ Image read, size:", imageBase64.length, "bytes");
    
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };
    const mimeType = mimeTypes[ext] || 'image/jpeg';
    console.log("📷 MIME type:", mimeType);

    const prompt = `Analyze this t-shirt product image and return ONLY valid JSON (no markdown, no code blocks):
{
  "name": "product name",
  "category": "men | women | unisex | kids",
  "colors": ["color1", "color2"],
  "description": "brief description",
  "tags": ["tag1", "tag2"]
}`;

    console.log("🤖 Calling Gemini API...");
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64
        }
      },
      { text: prompt }
    ]);

    console.log("✅ API response received");
    const text = result.response.text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    console.log("📝 Parsed response:", text);
    return JSON.parse(text);
  } catch (error) {
    console.error("❌ Gemini Vision Error:", error.message);
    console.error("Stack:", error.stack);
    throw error;
  }
}

module.exports = { analyzeProductImage, listAvailableModels };
