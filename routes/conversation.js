import express from "express";
import conversationControler from "../controllers/conversationController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router
  .route("/:projectId")
  .get(verifyJWT, conversationControler.getConversationByProject);

router.route("/").post(verifyJWT, conversationControler.createConversation);

export default router;
