import mongoose from "mongoose";

//participantSchema : dùng để mô tả thông tin cơ bản của người dùng 
//trong cuộc trò chuyện => tách ra cho dễ đọc
const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
},
{
    _id: false
})

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},
{
    _id: false
})

const lastMessageSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    content:{
        type: String,
        default: null
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: null
    }
},
{
    id: false
})

const conversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['direct', 'group'],
        required: true
    },
    participants: {
        type: [participantSchema],
        required: true
    },
    group: {
        type: groupSchema
    },
    lastMessageAt: {
        type: Date
    },
    seenBy: [
        {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
        }
    ],
    lastMessage: {
        type: lastMessageSchema,
        default: null
    },
    unreadCounts: {
        type: Map,
        of: Number,
        default: {}
    },
},{
    timestamps: true
})

//Khi truy vấn nhanh 1 cuộc hội thoại của người dùng nào đó thì mongodb 
// có thể lấy ra nhanh nhất những cuộc hội thoại vừa có tin nhắn mới.
conversationSchema.index({
    "participant.userId" : 1,
    lastMessageAt: -1
})

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;