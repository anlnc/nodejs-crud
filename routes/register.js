import express from "express";
import { handleRegister } from "../controllers/registerController.js";

const router = express.Router();

router.route("/").post(handleRegister);

export default router;
