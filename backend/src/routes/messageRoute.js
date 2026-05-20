import express from 'express'

import { sendDirectMessage, sendGroupMessage } from '../controllers/messageController.js'
import { checkFriendship, checkGroupMembership } from '../middlewares/friendMiddleware.js';
import { createRateLimiter } from '../middlewares/rateLimitMiddleware.js';
import { uploadSingleMessageImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

const sendMessageLimiter = createRateLimiter({
    windowMs: 10 * 1000,
    max: 20,
    message: "Ban gui tin nhan qua nhanh, vui long cham lai mot chut"
});

router.post("/direct", sendMessageLimiter, uploadSingleMessageImage, checkFriendship, sendDirectMessage);
router.post("/group", sendMessageLimiter, uploadSingleMessageImage, checkGroupMembership, sendGroupMessage);

export default router;
