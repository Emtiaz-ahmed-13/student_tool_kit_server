import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import path from "path";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import router from "./app/routes";

const app: Application = express();

// Add request logging for debugging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  console.log(
    `Full URL: ${req.protocol}://${req.get("host")}${req.originalUrl}`
  );
  next();
});

// Enhanced CORS configuration for deployment
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost for development
    if (
      origin.startsWith("http://localhost") ||
      origin.startsWith("https://localhost")
    ) {
      return callback(null, true);
    }

    // Allow your frontend domain(s) - add your frontend URL here
    // For example: if your frontend is at https://your-frontend.vercel.app
    const allowedOrigins = [
      // Add your frontend domains here
      "https://your-frontend-domain.vercel.app",
      "https://your-frontend-domain.com",
      // Add your actual frontend domain
      "https://student-tool-kit-frontend.vercel.app", // Replace with your actual frontend URL
    ];

    // Check if the origin is in the allowed list or if it's a partial match
    const isAllowed = allowedOrigins.some(
      (allowedOrigin) =>
        origin === allowedOrigin || origin.startsWith(allowedOrigin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Temporarily allow all for debugging
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static UI assets
const publicDir = path.join(process.cwd(), "public");
app.use(express.static(publicDir));

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Add logging to see when routes are being mounted
console.log("Mounting API routes at /api/v1");

app.use("/api/v1", router);

// Handle 404 for unmatched routes
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
