import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import env from "../config/env.service.js";
import AppError from "./utils/AppError.js";
import requestLogger from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import v1Router from "./modules/v1/index.js";
import path from "path";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        env.allowedOrigins.length === 0 ||
        env.allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(requestLogger);
app.use(globalLimiter);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.cookie.secret));
app.use(mongoSanitize());
if (!env.useCloudinaryUploads) {
  app.use("/uploads", express.static(path.join(process.cwd(), env.upload.dir)));
}

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: `${env.appName} backend is running`,
  });
});

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "success", data: { uptime: process.uptime() } });
});

app.use("/api/v1", v1Router);
app.use("/api", v1Router);

app.use("/api/:version", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `API version ${req.params.version} does not exist`,
  });
});

app.all("*", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
