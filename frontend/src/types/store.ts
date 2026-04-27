
import type { Socket } from "socket.io-client";
import type { Conversation, Message } from "./chat";
import type { Friend, FriendRequest, User } from "./user";

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    loading: boolean;
    
    setAccessToken: (accessToken: string) => void;
    setUser: (user: User) => void;
    clearState: () => void;

    signUp: (
        username: string,
        password: string,
        email: string,
        firstName: string,
        lastName: string
    ) => Promise<void>

    signIn: (
        username: string,
        password: string
    ) => Promise<void>

    signOut: () => Promise<void>

    fetchMe: () => Promise<void>

    refresh: () => Promise<void>
}

export interface ThemeState {
    //Cho biết có đang bật theme tối không
    isDark: boolean;
    //Hàm chuyển qua lại giữa sáng và tối
    toggleTheme: () => void;
    //Hàm dùng để cài theme khi app vừa load
    setTheme: (dark: boolean) => void;
}

export interface ChatState {
  // Danh sách các cuộc trò chuyện
  conversations: Conversation[];

  // Danh sách tin nhắn, được lưu theo từng conversationId
  // Ví dụ:
  // message["conversationId_123"] = {
  //   items: [...],
  //   hasMore: true,
  //   nextCursor: "abc"
  // }
  messages: Record<string, {
    // Danh sách tin nhắn của 1 cuộc trò chuyện
    items: Message[];

    // Còn tin nhắn cũ để load thêm hay không
    hasMore: boolean;

    // Cursor dùng để phân trang tin nhắn
    // Nếu null hoặc undefined thì không còn trang tiếp theo
    nextCursor?: string | null;
  }>;

  // Id của cuộc trò chuyện đang được mở
  activeConversationId: string | null;

  // Trạng thái đang loading dữ liệu
  convoLoading: boolean;

  messageLoading: boolean;

  loading: boolean;

  // Reset toàn bộ state chat về ban đầu
  reset: () => void;

  // Chọn cuộc trò chuyện đang active
  // id = string => mở cuộc trò chuyện đó
  // id = null => chưa chọn cuộc trò chuyện nào
  setActiveConversation: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId?: string) => Promise<void>;
  sendDirectMessage: (
    recipientId: string,
    content: string,
    imgUrl?: string
  ) => Promise<void>
  sendGroupMessage: (
    conversationId: string,
    content: string,
    imgUrl?: string
  ) => Promise<void>

  //add message
  addMessage: (message: Message) => Promise<void>;
  //update convo
  updateConversation: (conversation: unknown) => void;
  markAsSeen: () => Promise<void>;
  
  addConvo:(convo: Conversation) => void;
  createConversation: (type: "group" | "direct", name: string, memberIds: string[]) => Promise<void>
}

export interface SocketState {
    socket: Socket | null;
    onlineUsers: string[];
    connectSocket: () => void;
    disconnectSocket: () => void;
}

export interface FriendState {
  friends: Friend[];
  loading: boolean;
  receivedList: FriendRequest[];
  sentList: FriendRequest[];
  searchByUsername: (username: string) => Promise<User | null>;
  addFriend: (to: string, message?:string) => Promise<string>;
  getAllFriendRequests: () => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  getFriends: () => Promise<void>;
}

export interface UserState {
  updateAvatarUrl: (formData: FormData) => Promise<void>;
}