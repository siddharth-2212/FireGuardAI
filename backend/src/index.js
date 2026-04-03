import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// All API routes live under /api
app.use("/api", router);

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`FireGuard API running on port ${port}`);
});
