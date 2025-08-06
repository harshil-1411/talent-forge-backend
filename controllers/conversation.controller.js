import { Conversation } from "../models/conversation.model.js";

export const createConversation = async (req, res, next) => {
  try {
    const existingConversation = await Conversation.findOne({
      sellerId: req.isSeller ? req.userId : req.body.to,
      buyerId: req.isSeller ? req.body.to : req.userId,
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    const newConversation = new Conversation({
      sellerId: req.isSeller ? req.userId : req.body.to,
      buyerId: req.isSeller ? req.body.to : req.userId,
      readBySeller: req.isSeller,
      readByBuyer: !req.isSeller,
      lastMessage: "",
    });

    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (err) {
    console.error("Error creating conversation:", err);
    next(err);
  }
};

export const updateConversation = async (req, res, next) => {
  try {
    const updatedConversation = await Conversation.findOneAndUpdate(
      { id: req.params.id }, // Note: Using 'id' field from your schema
      {
        $set: req.isSeller 
          ? { readBySeller: true } 
          : { readByBuyer: true },
      },
      { new: true }
    );
    res.status(200).send(updatedConversation);
  } catch (err) {
    next(err);
  }
};

export const getSingleConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return next(createError(404, "Conversation not found"));
    }

    // Verify user is part of the conversation
    if (conversation.sellerId !== req.userId && conversation.buyerId !== req.userId) {
      return next(createError(403, "You can only view your own conversations"));
    }

    res.status(200).json(conversation);
  } catch (err) {
    console.error("Error getting conversation:", err);
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find(
      req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }
    )
    .sort({ updatedAt: -1 })
    .populate("sellerId", "username img") // Fetches username and img for the seller
    .populate("buyerId", "username img");  // Fetches username and img for the buyer

    res.status(200).send(conversations);
  } catch (err) {
    next(err);
  }
};