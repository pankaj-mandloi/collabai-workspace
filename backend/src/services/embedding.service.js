import { GoogleGenerativeAI } from "@google/generative-ai";

class EmbeddingService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required for embeddings");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    // Use LATEST Gemini embedding model (2026)
    // gemini-embedding-001: 3072 dimensions, state-of-the-art quality
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: "gemini-embedding-001",
    });

    console.log("✅ Embedding service initialized (gemini-embedding-001)");
  }

  /**
   * Generate embedding for a single text
   * Uses latest Gemini embedding model
   */
  async generateEmbedding(text) {
    try {
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return null;
      }

      // Truncate to model's max input (8192 tokens ~= 2000 chars safe)
      const truncatedText = text.substring(0, 2000);

      const result = await this.embeddingModel.embedContent(truncatedText);
      const embedding = result.embedding.values;

      console.log(`✅ Embedding generated (${embedding.length} dims)`);
      return embedding;
    } catch (error) {
      console.error("❌ Embedding error:", error.message);
      return null;
    }
  }

  /**
   * Generate multiple embeddings in batch
   */
  async generateBatchEmbeddings(texts) {
    try {
      const embeddings = await Promise.all(
        texts.map((text) => this.generateEmbedding(text))
      );
      return embeddings.filter((e) => e !== null);
    } catch (error) {
      console.error("❌ Batch embedding error:", error.message);
      return [];
    }
  }

  /**
   * Strip HTML from text (for documents)
   */
  stripHTML(html) {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
  }

  /**
   * Prepare text for embedding
   */
  prepareText(text, type = "text") {
    if (!text) return "";
    let cleaned = text;
    if (type === "document") {
      cleaned = this.stripHTML(cleaned);
    }
    return cleaned.replace(/\s+/g, " ").trim();
  }
}

// Singleton
let embeddingServiceInstance = null;

export const getEmbeddingService = () => {
  if (!embeddingServiceInstance) {
    embeddingServiceInstance = new EmbeddingService();
  }
  return embeddingServiceInstance;
};

export default getEmbeddingService;