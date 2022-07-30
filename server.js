import express from "express";
import loginRoute from "./routes/login.js";
import records from "./routes/records.js";
import registerRoute from "./routes/register.js";
import mainRoute from "./routes/index.js";
import cors from "cors";

import * as dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3500;

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/", mainRoute);
app.use("/login", loginRoute);
app.use("/records", records);
app.use("/register", registerRoute);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}/`)
);
