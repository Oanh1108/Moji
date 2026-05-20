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
import { corsOptions } from './utils/corsOptions.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

//middleware
app.use(express.json({limit: '32kb'}));
app.use(cookieParser());
app.use(cors(corsOptions))
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

//CLOUDINARY Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//public routes
app.get("/api/health", (req, res) => {
    res.status(200).json({status: "ok"});
});

app.use("/api/auth", authRoute)

//private routes
app.use(protectedRoute)
app.use("/api/users", userRoute);
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", converesationRoute);

app.use((err, req, res, next) => {
    console.error("Unhandled server error", err);

    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({message: "JSON không hợp lệ"});
    }

    return res.status(500).json({message: "Lỗi hệ thống"});
});

connectDB().then(()=>{
    server.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`)
})
})


