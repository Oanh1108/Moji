import {create} from 'zustand'
import {io, type Socket} from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import type { SocketState } from '@/types/store';
import { useChatStore } from './useChatStore';

const getSocketUrl = () =>
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
    window.location.origin;
const typingTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    onlineUsers:[],
    typingUsers: {},
    connectSocket: () => {
        const accessToken = useAuthStore.getState().accessToken;
        const existingSocket = get().socket;

        if(!accessToken) return;

        if(existingSocket?.connected) return;

        if(existingSocket) {
            existingSocket.disconnect();
        }

        const socket: Socket = io(getSocketUrl(), {
            auth: {token: accessToken},
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 500,
            timeout: 20000,
        });

        set({socket});
        let refreshingToken = false;

        socket.on("connect", () => {
            console.log("Da ket noi socket")
        });

        socket.on("connect_error", async (error) => {
            console.error("Loi ket noi socket", error.message);

            if(!error.message.includes("Unauthorized") || refreshingToken) {
                return;
            }

            refreshingToken = true;

            try {
                await useAuthStore.getState().refresh();
                const newToken = useAuthStore.getState().accessToken;

                if(newToken) {
                    socket.auth = {token: newToken};
                    socket.connect();
                }
            } finally {
                refreshingToken = false;
            }
        });

        socket.on("disconnect", (reason) => {
            console.warn("Mat ket noi socket", reason);
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

        socket.on("new-message", async ({message, conversation, unreadCounts}) => {
            if(message?.conversationId) {
                socket.emit("join-conversation", message.conversationId);
            }

            const isKnownConversation = useChatStore
                .getState()
                .conversations
                .some((c) => c._id === conversation?._id);

            if(!isKnownConversation) {
                await useChatStore.getState().fetchConversations();
            }

            await useChatStore.getState().addMessage(message);

            if(!conversation?.lastMessage) {
                return;
            }

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

            useChatStore.getState().updateConversation(updateConversation);

            if(useChatStore.getState().activeConversationId === message.conversationId){
                useChatStore.getState().markAsSeen(message.conversationId);
            }
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
            set({socket: null, typingUsers: {}, onlineUsers: []})
        }
    },
}))
