import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './libs/db.js';
import dns from 'dns'
dns.setServers(['1.1.1.1','8.8.8.8'])
import authRoute from './routes/authRoute.js'
import cookieParser from 'cookie-parser'
import userRoute from './routes/userRoute.js'
import { protectedRoute } from './middlewares/authMiddleware.js';
import cors from 'cors'
import friendRoute from './routes/friendRoute.js'
import messageRoute from './routes/messageRoute.js'
import converesationRoute from './routes/conversationRoute.js'
import {app, server} from './socket/index.js'
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const PORT = process.env.PORT || 5001;

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}))

//CLOUDINARY Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//public routes
app.use("/api/auth", authRoute)

//private routes
app.use(protectedRoute)
app.use("/api/users", userRoute);
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", converesationRoute);


connectDB().then(()=>{
    server.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`)
})
})


