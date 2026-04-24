import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Conversation",
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content : {
        type: String,
        trim: true
    },
    imgUrl: {
        type: String
    }
},
{
    timestamps: true
})

//index là các database tạo ra 1 bảng tra cứu nhanh
//index kết hợp (compound index) là loại index bao gồm nhiều trường.
messageSchema.index({conversationId: 1, createdAt: -1});

const Message = mongoose.model("Message", messageSchema);

export default Message;
