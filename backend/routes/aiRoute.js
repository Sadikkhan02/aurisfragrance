import express from "express";
import {
  getAssistantRecommendations,
  backfillProductEmbeddings,
} from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/assistant", getAssistantRecommendations);
aiRouter.post("/backfill", backfillProductEmbeddings);
aiRouter.get("/backfill", backfillProductEmbeddings); // Support GET for easy browser-based triggering

export default aiRouter;
