import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { getReviews } from "../controller/review.controller.js";
import { createReview } from "../controller/review.controller.js";
import { deleteReview } from "../controller/review.controller.js";

const router = express.Router();

router.post("/", verifyToken, createReview )
router.get("/:gigId", getReviews )
router.delete("/:id", deleteReview)

export default router;