import createError from "../utils/createError.js";
import {Review} from "../models/review.model.js"; // Corrected import path assuming standard naming
import { Gig } from "../models/gig.model.js";

export const createReview = async (req, res, next) => {
  try {
    const { gigId, desc, star } = req.body;

    // Validate required fields
    if (!gigId || !desc || !star) {
      return next(createError(400, "Please provide all required fields"));
    }

    // A seller cannot review a gig
    if (req.isSeller) {
      return next(createError(403, "Sellers can't create a review!"));
    }

    // Create new review
    const newReview = new Review({
      userId: req.userId,
      gigId,
      desc,
      star: parseInt(star),
    });

    // Check if the user has already reviewed this specific gig
    const existingReview = await Review.findOne({
      userId: req.userId,
      gigId: gigId,
    });

    if (existingReview) {
      return next(createError(403, "You have already created a review for this gig!"));
    }

    // Check if the gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return next(createError(404, "Gig not found!"));
    }

    // Save the review
    const savedReview = await newReview.save();

    // Update gig stats
    await Gig.findByIdAndUpdate(gigId, {
      $inc: { totalStars: parseInt(star), starNumber: 1 },
    });

    // Return populated review
    const populatedReview = await Review.findById(savedReview._id).populate("userId", "username img country");
    
    res.status(201).json(populatedReview);
  } catch (err) {
    console.error("Error creating review:", err);
    next(err);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ gigId: req.params.gigId })
      .populate({
        path: "userId",
        select: "username img country"
      });
    
    if (!reviews) {
      return next(createError(404, "No reviews found!"));
    }
    
    res.status(200).send(reviews);
  } catch (err) {
    next(err);
  }
};
    