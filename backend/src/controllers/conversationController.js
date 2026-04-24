import Conversation from "../models/Conversastion.js"
import Message from "../models/Message.js"

export const creteConversation = async (req, res) => {
    try {
        const {type, name, memberIds} = req.body;
        const userId = req.user._id;

        if(!type || 
            (type === 'group' && !name) ||
            !memberIds || 
            !Array.isArray(memberIds) || 
            memberIds.length === 0
        ) {
            return res.status(400).json({message: "Tên nhóm và danh sách thành viên là bắt buộc"})
        }

        let conversation;

        // Nếu loại cuộc trò chuyện là direct
        // nghĩa là chat 1-1 giữa 2 người dùng
        if (type === "direct") {
            // Lấy id của người còn lại trong cuộc trò chuyện
            // memberIds[0] là người mà user hiện tại muốn nhắn tin
            const participantId = memberIds[0];

            // Tìm xem giữa user hiện tại và participantId
            // đã có conversation direct nào tồn tại chưa
            conversation = await Conversation.findOne({
                type: "direct",

                // Kiểm tra trong mảng participants.userId
                // có chứa đủ cả userId và participantId hay không
                "participants.userId": { $all: [userId, participantId] }
            });
                if(!conversation) {
            conversation = new Conversation({
                type: 'direct',
                participants: [{userId}, {userId: participantId}],
                lastMessageAt: new Date(),
            });

            await conversation.save();
        }
        }

        

        if (type === 'group'){
            conversation = new Conversation({
                type: 'group',
                participants : [
                    {userId},
                    ...memberIds.map((id) => ({userId: id}))
                ],
                group: {
                    name, 
                    createdBy: userId
                },
                lastMessageAt: new Date()
            });

            await conversation.save();
        }

        if(!conversation) {
            return res.status(400).json({message: 'Conversation type không hợp lệ'})
        }

        await conversation.populate([
            {path: 'participants.userId', select: 'displayName avatarUrl'},
            {
                path: 'seenBy',
                select: 'displayName avatarUrl',
            },
            {
                path: "lastMessage.senderId", select: "displayName avatarUrl"
            }
        ])

        return res.status(201).json({conversation});

    } catch (error) {
        console.error("Lỗi khi tạo conversation", error);
        return res.status(500).json({message: "Lỗi hệ thống", error: error.message})
    }
}

export const getConversations = async (req, res) => {
    try {
        // Lấy id của user đang đăng nhập
        // req.user được tạo ra từ middleware xác thực token
        const userId = req.user._id;

        // Tìm tất cả cuộc trò chuyện mà user hiện tại có tham gia
        const conversations = await Conversation.find({
            'participants.userId': userId
        })

        // Sắp xếp cuộc trò chuyện mới nhất lên đầu
        .sort({ lastMessageAt: -1, updatedAt: -1 })

        // populate dùng để lấy thông tin chi tiết của user
        // thay vì chỉ lấy mỗi userId
        .populate({
            path: 'participants.userId',
            select: 'displayName avatarUrl'
        })

        // Lấy thông tin người gửi tin nhắn cuối cùng
        .populate({
            path: 'lastMessage.senderId',
            select: "displayName avatarUrl"
        })

        // Lấy thông tin những user đã xem tin nhắn
        .populate({
            path: "seenBy",
            select: "displayName avatarUrl"
        });

        // Format lại dữ liệu trước khi trả về frontend
        const formatted = conversations.map((convo) => {
            // convo là từng conversation trong danh sách conversations

            // Format lại danh sách người tham gia cuộc trò chuyện
            const participants = (convo.participants || []).map((p) => ({
                _id: p.userId?._id,
                displayName: p.userId?.displayName,
                avatarUrl: p.userId?.avatarUrl ?? null,
                joinedAt: p.joinedAt
            }));

            // Trả về conversation mới đã được format
            return {
                // Chuyển mongoose document thành object thường
                ...convo.toObject(),

                // Nếu unreadCounts không có thì trả về object rỗng
                unreadCounts: convo.unreadCounts || {},

                // Ghi đè participants bằng danh sách đã format
                participants,
            };
        });

        // Trả danh sách conversation về client
        return res.status(200).json({
            conversations: formatted
        });

    } catch (error) {
        // In lỗi ra terminal để debug
        console.error("Lỗi xảy ra khi lấy conversations", error);

        // Trả lỗi về client
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
};

//Lấy toàn bộ tin nhắn trong cuộc hội thoại
export const getMessages = async (req, res) => {
    try {
        // Lấy conversationId từ URL params
        // Ví dụ URL: /conversations/abc123/messages
        const { conversationId } = req.params;

        // Lấy limit và cursor từ query string
        // limit: số lượng tin nhắn muốn lấy, mặc định là 50
        // cursor: mốc thời gian để lấy tin nhắn cũ hơn
        const { limit = 50, cursor } = req.query;

        // Tạo điều kiện tìm tin nhắn theo conversationId
        const query = { conversationId };

        // Nếu có cursor thì chỉ lấy những tin nhắn cũ hơn cursor
        // Dùng để phân trang khi kéo lên xem tin nhắn cũ
        if (cursor) {
            query.createdAt = { $lt: new Date(cursor) };
        }

        // Tìm tin nhắn trong database
        // Sắp xếp mới nhất trước
        // Lấy dư 1 tin nhắn để biết còn trang tiếp theo hay không
        let messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit) + 1);

        // nextCursor dùng để frontend gọi tiếp trang sau
        let nextCursor = null;

        // Nếu số tin nhắn lấy được lớn hơn limit
        // nghĩa là vẫn còn tin nhắn cũ hơn
        if (messages.length > Number(limit)) {
            // Tin nhắn cuối cùng sẽ làm mốc cursor tiếp theo
            const nextMessage = messages[messages.length - 1];

            // Lưu thời gian tạo tin nhắn làm cursor
            nextCursor = nextMessage.createdAt.toISOString();

            // Xóa tin nhắn lấy dư ra khỏi kết quả trả về
            messages.pop();
        }

        // Đảo lại thứ tự để frontend hiển thị từ cũ đến mới
        messages = messages.reverse();

        // Trả danh sách tin nhắn và cursor về client
        return res.status(200).json({
            messages,
            nextCursor
        });

    } catch (error) {
        // In lỗi ra terminal để debug
        console.error("Lỗi xảy ra khi lấy messages", error);

        // Trả lỗi về client
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
};
