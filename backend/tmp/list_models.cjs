const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.listModels();
    for (const model of models.models) {
      console.log(`Name: ${model.name}, Methods: ${model.supportedGenerationMethods}`);
    }
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

run();
