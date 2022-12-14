import express from "express";
import loginRoute from "./routes/login.js";
import projects from "./routes/projects.js";
import registerRoute from "./routes/register.js";
import downloadRoute from "./routes/download.js";
import conversationRoute from "./routes/conversation.js";
import mainRoute from "./routes/index.js";
import cors from "cors";

import * as dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3500;

const app = express();

// Middleware
const WHITE_LIST = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    // if (origin && !WHITE_LIST.includes(origin)) {
    //   return callback(new Error("NOT ALLOWED"));
    // }
    // console.log("[INFO] History access: ", { origin });
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/", mainRoute);
app.use("/login", loginRoute);
app.use("/projects", projects);
app.use("/register", registerRoute);
app.use("/download", downloadRoute);
app.use("/conversations", conversationRoute);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}/`)
);
