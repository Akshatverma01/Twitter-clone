import express from "express";
import { getAuthUser, login, logout, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/authUser",protectRoute, getAuthUser);
router.post("/signUp",signup);
router.post("/login",login);
router.post("/logout",logout)



export default router;