import express, { Request, Response } from "express";
const router = express.Router();

// Extend the Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Simple test route to verify API is working
router.get("/test", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Test route is working!",
    timestamp: new Date().toISOString(),
  });
});

// Add this route to test authentication
router.get("/test-auth", (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Authenticated test route is working!",
    timestamp: new Date().toISOString(),
    user: req.user || null,
  });
});

export default router;
