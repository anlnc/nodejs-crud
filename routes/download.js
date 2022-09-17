import express from "express";
import downloadControler from "../controllers/downloadControler.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router
  .route("/:projectId")
  .get(verifyJWT, downloadControler.downloadProjectById);

export default router;
