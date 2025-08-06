import { Conversation } from "../models/Conversation.model.js";

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
    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.isSeller 
          ? { readBySeller: true } 
          : { readByBuyer: true }
      },
      { new: true }
    );

    if (!updatedConversation) {
      return next(createError(404, "Conversation not found"));
    }

    res.status(200).json(updatedConversation);
  } catch (err) {
    console.error("Error updating conversation:", err);
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
    console.log("Getting conversations for user:", req.userId, "isSeller:", req.isSeller);
    
    const conversations = await Conversation.find(
      req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }
    ).sort({ updatedAt: -1 });
    
    console.log("Found conversations:", conversations.length);
    
    res.status(200).send(conversations);
  } catch (err) {
    console.error("Error getting conversations:", err);
    next(err);
  }
};