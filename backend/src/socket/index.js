import {Server} from 'socket.io'
import http from 'http'
import express from 'express'
import { socketAuthMiddleware } from '../middlewares/socketMiddleware.js';
import { getUserConversationsForSocketIO } from '../controllers/conversationController.js';
import { corsOptions } from '../utils/corsOptions.js';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: corsOptions,
    maxHttpBufferSize: 1024 * 1024,
});

io.use(socketAuthMiddleware)

const onlineUsers = new Map(); // { userId: Set<socketId> }
const TYPING_THROTTLE_MS = 700;

io.on("connection", async (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    const userSockets = onlineUsers.get(userId) ?? new Set();
    const wasOffline = userSockets.size === 0;

    userSockets.add(socket.id);
    onlineUsers.set(userId, userSockets);

    console.log(`${user.displayName} online voi socket ${socket.id}`)

    socket.emit("online-users", Array.from(onlineUsers.keys()));

    if (wasOffline) {
        socket.broadcast.emit("user-online", userId);
    }

    const conversationIds = await getUserConversationsForSocketIO(userId);
    conversationIds.forEach((id) => {
        socket.join(id);
    });

    socket.on("join-conversation", (conversationId) => {
        socket.join(conversationId); 
    });

    socket.join(userId);

    socket.on("typing", ({conversationId}) => {
        if(!conversationId) return;

        const now = Date.now();
        socket.data.typingLastSent ??= new Map();

        const lastSentAt = socket.data.typingLastSent.get(conversationId) ?? 0;
        if (now - lastSentAt < TYPING_THROTTLE_MS) return;

        socket.data.typingLastSent.set(conversationId, now);

        socket.to(conversationId).emit("typing", {
            conversationId,
            userId,
        });
    });

    socket.on("disconnect", () => {
        const sockets = onlineUsers.get(userId);

        if (sockets) {
            sockets.delete(socket.id);

            if (sockets.size === 0) {
                onlineUsers.delete(userId);
                socket.broadcast.emit("user-offline", userId);
            }
        }

        console.log(`socket disconnected: ${socket.id}`);
    });
});

export {io, app, server}
