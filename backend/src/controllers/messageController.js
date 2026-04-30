import Conversation from '../models/Conversastion.js'
import Message from '../models/Message.js'
import { emitNewMessage, updateConversationAfterCreateMessage } from '../utils/messageHelper.js';
import {io} from '../socket/index.js'

export const sendDirectMessage = async (req, res) => {
   try {
    const {recipientId, content, conversationId} = req.body;
    const senderId = req.user._id;

    //Tạo 1 biến để lưu thông tin cuộc trò chuyện
    let conversation;

    if(!content){
        return res.status(400).json({message: "Thiếu nội dung"})
    }

    //Tìm hoặc tạo conversation
    if (conversationId) {
    conversation = await Conversation.findById(conversationId);
} else {
    conversation = await Conversation.findOne({
        type: "direct",
        participants: {
            $all: [
                { $elemMatch: { userId: senderId } },
                { $elemMatch: { userId: recipientId } }
            ]
        }
    });
}

    //Nếu không có hoặc không tìm thấy conversation thì tạo 1 conversation mới
    if(!conversation){
        conversation = await  Conversation.create({
            type: "direct",
            participants: [
                {userId: senderId, joinedAt: new Date()},
                {userId: recipientId, joinedAt: new Date()}
            ],
            lastMessageAt: new Date(),
            unreadCounts: new Map()
        })
    }

    //tạo 1 tin nhắn mới khi đã có cuộc hội thoại
    const message = await Message.create({
        conversationId: conversation._id,
        senderId,
        content,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message)

    return res.status(201).json({message})

   } catch (error) {
     console.error("Lỗi xảy ra khi gửi tin nhắn trực tiếp");
     return res.status(500).json({message: "Lỗi hệ thống", error: error.message})
   } 
} ;

export const sendGroupMessage = async (req, res) => {
    try {
        // Lấy conversationId và nội dung tin nhắn từ body
        const { conversationId, content } = req.body;

        // Lấy id của người gửi từ middleware auth
        const senderId = req.user._id;

        // Lấy conversation từ middleware kiểm tra group/conversation
        const conversation = req.conversation;

        // Nếu không có nội dung thì báo lỗi
        if (!content) {
            return res.status(400).json({
                message: "Thiếu nội dung"
            });
        }

        // Tạo tin nhắn mới trong database
        const message = await Message.create({
            conversationId,
            senderId,
            content
        });

        // Cập nhật thông tin conversation sau khi có tin nhắn mới
        // Ví dụ: lastMessage, seenBy, unreadCounts
        updateConversationAfterCreateMessage(
            conversation,
            message,
            senderId
        );

        // Lưu lại conversation sau khi cập nhật
        await conversation.save();

        emitNewMessage(io, conversation, message)

        // Trả tin nhắn mới về client
        return res.status(201).json({ message });

    } catch (error) {
        // In lỗi ra terminal để debug
        console.error("Lỗi xảy ra khi gửi tin nhắn nhóm", error);

        // Trả lỗi về client
        return res.status(500).json({
            message: "Lỗi hệ thống",
            error: error.message
        });
    }
};