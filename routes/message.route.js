import { Router } from "express";
import {verifyToken} from "../middlewares/jwt.js";
import { createMessage, getMessages } from "../controllers/message.controller.js";

const router = Router();


router.post("/", verifyToken, createMessage);
router.get("/:conversationId", verifyToken, getMessages);


export default router;