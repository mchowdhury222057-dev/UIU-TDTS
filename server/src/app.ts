import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { attachUser } from "./middleware/auth";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { redactSensitiveFields } from "./middleware/redactSensitive";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(redactSensitiveFields);
app.use(attachUser);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
