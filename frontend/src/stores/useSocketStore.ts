import {create} from 'zustand'
import {io, type Socket} from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import type { SocketState } from '@/types/store';
import { useChatStore } from './useChatStore';

const baseUrl = import.meta.env.VITE_SOCKET_URL;
const typingTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    onlineUsers:[],
    typingUsers: {},
    connectSocket: () => {
        const accessToken = useAuthStore.getState().accessToken;
        const existingSocket = get().socket;

        if(existingSocket) return; //tránh tạo nhiều socket

        const socket: Socket = io(baseUrl, {
            auth: {token: accessToken},
            transports: ["websocket"]
        });

        set({socket});

        socket.on("connect", () => {
            console.log("Đã kết nối socket")
        });

        //online users
        socket.on("online-users", (userIds) => {
            set({onlineUsers: userIds})
        })

        socket.on("typing", ({conversationId, userId}) => {
            if(!conversationId || !userId) return;

            console.log("CLIENT nhận typing", {conversationId, userId});

            if(typingTimers[conversationId]){
                clearTimeout(typingTimers[conversationId]);
            }

            set((state) => ({
                typingUsers: {
                    ...state.typingUsers,
                    [conversationId]: userId
                }
            }));

            typingTimers[conversationId] = setTimeout(() => {
                set((state) => {
                    const typingUsers = {...state.typingUsers};
                    delete typingUsers[conversationId];
                    return {typingUsers};
                });
                delete typingTimers[conversationId];
            }, 2000);
        });

        //new message
        socket.on("new-message", ({message, conversation, unreadCounts}) => {
            useChatStore.getState().addMessage(message);

            const lastMessage = {
                _id: conversation.lastMessage._id,
                content: conversation.lastMessage.content,
                createdAt: conversation.lastMessage.createdAt,
                sender: {
                    _id: conversation.lastMessage.senderId,
                    displayName: "",
                    avatarUrl: null
                }
            };

            const updateConversation = {
                ...conversation,
                lastMessage,
                unreadCounts
            }

            if(useChatStore.getState().activeConversationId === message.conversationId){
                //đánh dấu đã đọc
                useChatStore.getState().markAsSeen();
            }

            useChatStore.getState().updateConversation(updateConversation);
        })

        // read message
        socket.on("read-message", ({conversation, lastMessage}) => {
            const updated = {
                _id: conversation._id,
                lastMessage,
                lastMessageAt: conversation.lastMessageAt,
                unreadCounts: conversation.unreadCounts,
                seenBy: conversation.seenBy
            };

            useChatStore.getState().updateConversation(updated);
        })

        //new group chat
        socket.on('new-group', (conversation) => {
            useChatStore.getState().addConvo(conversation);
            socket.emit('join-conversation', conversation._id);
        });

    },
    disconnectSocket: () => {
        const socket = get().socket;
        if(socket) {
            socket.disconnect();
            Object.values(typingTimers).forEach(clearTimeout);
            Object.keys(typingTimers).forEach((key) => delete typingTimers[key]);
            set({socket: null, typingUsers: {}})
        }
    },
}))


