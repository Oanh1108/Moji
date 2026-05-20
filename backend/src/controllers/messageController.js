import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import { uploadImageFromBuffer } from '../middlewares/uploadMiddleware.js';
import { emitNewMessage, updateConversationAfterCreateMessage } from '../utils/messageHelper.js';
import {io} from '../socket/index.js'

const uploadMessageImage = async (file) => {
    if(!file) return null;

    const result = await uploadImageFromBuffer(file.buffer, {
        folder: "moji_chat/messages",
        transformation: [
            {width: 1280, height: 1280, crop: "limit", quality: "auto", fetch_format: "auto"}
        ],
    });

    return result.secure_url;
}

export const sendDirectMessage = async (req, res) => {
   try {
    const {recipientId, content, conversationId} = req.body;
    const senderId = req.user._id;
    const textContent = content?.trim() ?? "";

    let conversation;

    if(!textContent && !req.file){
        return res.status(400).json({message: "Thiếu nội dung hoặc ảnh"})
    }

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

    if(!conversation){
        conversation = await Conversation.create({
            type: "direct",
            participants: [
                {userId: senderId, joinedAt: new Date()},
                {userId: recipientId, joinedAt: new Date()}
            ],
            lastMessageAt: new Date(),
            unreadCounts: new Map()
        })
    }

    const imgUrl = await uploadMessageImage(req.file);

    const message = await Message.create({
        conversationId: conversation._id,
        senderId,
        content: textContent,
        imgUrl,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message)

    return res.status(201).json({message})

   } catch (error) {
     console.error("Lỗi xảy ra khi gửi tin nhắn trực tiếp", error);
     return res.status(500).json({message: "Lỗi hệ thống", error: error.message})
   } 
} ;

export const sendGroupMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const textContent = content?.trim() ?? "";
        const senderId = req.user._id;
        const conversation = req.conversation;

        if (!textContent && !req.file) {
            return res.status(400).json({
                message: "Thiếu nội dung hoặc ảnh"
            });
        }

        const imgUrl = await uploadMessageImage(req.file);

        const message = await Message.create({
            conversationId,
            senderId,
            content: textContent,
            imgUrl
        });

        updateConversationAfterCreateMessage(
            conversation,
            message,
            senderId
        );

        await conversation.save();

        emitNewMessage(io, conversation, message)

        return res.status(201).json({ message });

    } catch (error) {
        console.error("Lỗi xảy ra khi gửi tin nhắn nhóm", error);

        return res.status(500).json({
            message: "Lỗi hệ thống",
            error: error.message
        });
    }
};
