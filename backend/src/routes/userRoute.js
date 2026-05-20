 import express from 'express'
import { authMe, changePassword, searchUserByUsername, updateProfile, uploadAvatar } from '../controllers/userController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { createRateLimiter } from '../middlewares/rateLimitMiddleware.js';

 const router = express.Router();

 const searchLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    message: "Ban tim kiem qua nhanh, vui long thu lai sau"
 });

 const uploadAvatarLimiter = createRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: "Ban upload avatar qua nhanh, vui long thu lai sau"
 });

 const passwordLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Ban doi mat khau qua nhanh, vui long thu lai sau"
 });

 router.get("/me", authMe);

 router.patch("/me", updateProfile);

 router.patch("/password", passwordLimiter, changePassword);

 router.get("/search", searchLimiter, searchUserByUsername);

 router.post("/uploadAvatar", uploadAvatarLimiter, upload.single("file"), uploadAvatar)

 export default router;
