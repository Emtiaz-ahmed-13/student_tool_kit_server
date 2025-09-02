import express from "express";
import { AuthControllers } from "./auth.controllers";

const router = express.Router();

// Add a simple GET route to verify the auth module is working
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth module is working correctly",
    endpoints: {
      register: "POST /api/v1/auth/register",
      login: "POST /api/v1/auth/login",
    },
  });
});

router.post("/register", AuthControllers.register);
router.post("/login", AuthControllers.login);

export const AuthRoutes = router;
