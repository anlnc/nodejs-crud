import express from "express";
import recordController from "../controllers/projectsController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

router.route("/").get(verifyJWT, recordController.getAllRecords);
router.route("/").post(verifyJWT, recordController.createRecord);

export default router;
