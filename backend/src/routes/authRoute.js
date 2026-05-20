import express from 'express'
import { refreshToken, signIn, signOut, signUp } from '../controllers/authController.js';
import { createRateLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Ban dang thao tac qua nhanh, vui long thu lai sau"
});

const refreshLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: "Lam moi phien qua nhanh, vui long thu lai sau"
});

router.post("/signup", authLimiter, signUp)

router.post('/signin', authLimiter, signIn)

router.post('/signout', signOut)

router.post('/refresh', refreshLimiter, refreshToken)

export default router
