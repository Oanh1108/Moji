import express from 'express';
import {
    creteConversation,
    getConversations,
    getMessages   
} from '../controllers/conversationController.js'
import { checkFriendship } from '../middlewares/friendMiddleware.js';

const router = express.Router();

router.post("/", checkFriendship, creteConversation);
router.get("/", getConversations); 
router.get("/:conversationId/messages", getMessages);

export default router;