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

        if(existingSocket) return;

        const socket: Socket = io(baseUrl, {
            auth: {token: accessToken},
            transports: ["websocket"]
        });

        set({socket});

        socket.on("connect", () => {
            console.log("Da ket noi socket")
        });

        socket.on("online-users", (userIds: string[]) => {
            set({onlineUsers: userIds})
        })

        socket.on("user-online", (userId: string) => {
            set((state) => {
                if(state.onlineUsers.includes(userId)) {
                    return state;
                }

                return {
                    onlineUsers: [...state.onlineUsers, userId]
                };
            })
        })

        socket.on("user-offline", (userId: string) => {
            set((state) => ({
                onlineUsers: state.onlineUsers.filter((id) => id !== userId)
            }))
        })

        socket.on("typing", ({conversationId, userId}) => {
            if(!conversationId || !userId) return;

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
                useChatStore.getState().markAsSeen();
            }

            useChatStore.getState().updateConversation(updateConversation);
        })

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
