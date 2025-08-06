import { Router } from "express";
import { verifyToken } from "../middlewares/jwt.js";
import {
  createReview,
    getReviews,
} from "../controllers/review.controller.js";

const router = Router();

router.post("/", verifyToken, createReview);
router.get("/:gigId", getReviews);
// router.delete("/:id", verifyToken, deleteReview);

export default router;