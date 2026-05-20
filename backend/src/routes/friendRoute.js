import express from 'express'

import {
    acceptFriendRequest,
    sendFriendRequest,
    declineFriendRequest, 
    getAllFriends,
    getFriendRequests
} from '../controllers/friendController.js'
import { createRateLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const friendActionLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: "Ban thao tac ban be qua nhanh, vui long thu lai sau"
});

router.post('/requests', friendActionLimiter, sendFriendRequest);

router.post('/requests/:requestId/accept', friendActionLimiter, acceptFriendRequest);

router.post('/requests/:requestId/decline', friendActionLimiter, declineFriendRequest);

router.get('/', getAllFriends);

router.get('/requests', getFriendRequests);

export default router;
