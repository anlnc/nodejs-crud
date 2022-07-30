import express from "express";
import recordController from "../controllers/recordController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// router.route("/:id").get(recordController.getRecordById);
router.route("/").get(verifyJWT, recordController.getAllRecords);
router.route("/").post(verifyJWT, recordController.createRecord);

export default router;
