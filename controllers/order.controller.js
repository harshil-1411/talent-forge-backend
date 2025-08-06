import {Order} from "../models/order.model.js";
import {Gig} from "../models/gig.model.js";
import createError from "../utils/createError.js";

export const createOrder = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return next(createError(404, "Gig not found"));
    if (gig.userId.toString() === req.userId) {
      return next(createError(403, "You cannot order your own gig."));
    }

    const newOrder = new Order({
      gigId: gig._id,
      img: gig.cover,
      title: gig.title,
      price: gig.price,
      sellerId: gig.userId,
      buyerId: req.userId,
      payment_intent: "temporary", // Placeholder
    });

    await newOrder.save();
    res.status(201).send("Order has been created.");
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      ...(req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }),
      isCompleted: true, // Typically you'd only show completed orders
    });

    res.status(200).send(orders);
  } catch (err) {
    next(err);
  }
};