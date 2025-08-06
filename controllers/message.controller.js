import {Message} from "../models/Message.model.js";
import {Conversation} from "../models/Conversation.model.js";
import createError from "../utils/createError.js";


export const createMessage = async (req, res, next) => {
    try {
        if (!req.body.conversationId || !req.body.desc) {
            return next(createError(400, "Please provide both conversation ID and message"));
        }

        // Verify the conversation exists and user is a participant
        const conversation = await Conversation.findById(req.body.conversationId);
        if (!conversation) {
            return next(createError(404, "Conversation not found"));
        }

        // Check if user is part of the conversation
        if (conversation.buyerId !== req.userId && conversation.sellerId !== req.userId) {
            return next(createError(403, "You cannot send messages in this conversation"));
        }

        // Create and save the new message
        const newMessage = new Message({
            conversationId: req.body.conversationId,
            senderId: req.userId,
            desc: req.body.desc,
        });

        const savedMessage = await newMessage.save();
        
        // Update the conversation with the last message
        await Conversation.findByIdAndUpdate(
            req.body.conversationId,
            {
                $set: {
                    readBySeller: req.isSeller,
                    readByBuyer: !req.isSeller,
                    lastMessage: req.body.desc,
                },
            },
            { new: true }
        );

        res.status(201).json(savedMessage);
    } catch (err) {
        console.error("Error creating message:", err);
        next(err);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ conversationId: req.params.conversationId })
            .sort({ createdAt: 1 }); // Sort messages by creation time

        res.status(200).json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        next(err);
    }
}