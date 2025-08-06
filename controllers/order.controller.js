import { Order } from "../models/order.model.js";
import { Gig } from "../models/gig.model.js";

export const createOrder = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) {
      return next(new Error("Gig not found"));
    }

    // Check if user is not trying to buy their own gig
    if (gig.userId === req.userId) {
      return next(new Error("You cannot order your own gig"));
    }

    const newOrder = new Order({
      gigId: gig._id,
      img: gig.cover,
      title: gig.title,
      price: gig.price,
      sellerId: gig.userId,
      buyerId: req.userId,
      payment_intent: "temporary",
      isCompleted: true, // Since we're not implementing real payment for now
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    console.log("Getting orders for user:", req.userId, "isSeller:", req.isSeller);
    
    const query = {
      ...(req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }),
    };

    console.log("Query:", query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('gigId', 'title cover')
      .lean();

    console.log("Found orders:", orders);

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error getting orders:", err);
    next(err);
  }
};