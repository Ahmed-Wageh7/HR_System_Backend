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
import { isOriginAllowed } from "./utils/cors.js";
import path from "path";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = Array.from(
  new Set([
    "http://localhost:4200",
    "http://localhost:5173",
    "https://hr-system-frontend-*.vercel.app",
    ...env.allowedOrigins,
  ]),
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin, allowedOrigins)) {
      return callback(null, true);
    }

    return callback(new AppError(`Origin ${origin} is not allowed by CORS`, 403));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(
  cors(corsOptions),
);

app.options("*", cors(corsOptions));

app.use(helmet());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(env.cookie.secret));

app.use(mongoSanitize());

app.use(requestLogger);

app.use(globalLimiter);

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
  res.status(200).json({
    status: "success",
    data: {
      uptime: process.uptime(),
    },
  });
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
