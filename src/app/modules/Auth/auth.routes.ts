import express from "express";
import { AuthControllers } from "./auth.controllers";

const router = express.Router();

router.post("/register", AuthControllers.register);
router.post("/login", AuthControllers.login);

export const AuthRoutes = router;
