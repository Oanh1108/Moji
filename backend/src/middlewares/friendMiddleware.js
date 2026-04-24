import Conversation from "../models/Conversastion.js";
import Friend from "../models/Friend.js";

// Hàm dùng để sắp xếp 2 giá trị theo thứ tự cố định
// Nếu a nhỏ hơn b thì giữ nguyên [a, b]
// Nếu a lớn hơn hoặc bằng b thì đổi vị trí thành [b, a]
// Mục đích: giúp tạo cặp user giống nhau dù thứ tự truyền vào khác nhau
// Ví dụ: pair("user1", "user2") và pair("user2", "user1") đều ra cùng 1 kết quả
const pair = (a, b) => (a < b ? [a, b] : [b, a]);

export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id.toString();

        // Lấy recipientId từ body của request
        // recipientId là ID của người nhận tin nhắn
        // Dùng ?. để tránh lỗi nếu req.body bị undefined
        // Nếu không có recipientId thì gán giá trị mặc định là null
        const recipientId = req.body?.recipientId ?? null;
        const memberIds = req.body?.memberIds ?? [];

        // Nếu client không gửi recipientId
        // thì trả về lỗi 400 vì thiếu thông tin người nhận
        if (!recipientId && memberIds.length === 0) {
            return res.status(400).json({
                message: 'Cần cung cấp recipientId hoặc memberIds'
            });
        }

              if(recipientId) {
            const [userA, userB] = pair(me, recipientId);

            const isFriend = await Friend.findOne({userA, userB});

            if(!isFriend) {
                return res.status(403).json({message: 'Bạn chưa kết bạn với người này'})
            }

            return next();
        }

        //todo: chat nhóm (chỉ cho phép đã là bạn bè thì mới tạo nhóm)
        const friendChecks = memberIds.map(async (memberId) => {
            const [userA, userB] = pair(me, memberId);
            const friend = await Friend.findOne({userA, userB});
            return friend ? null : memberId;
        })

        const results = await Promise.all(friendChecks);
        const notFriends = results.filter(Boolean);

        if(notFriends.length > 0) {
            return res.status(403)
            .json({message: "Bạn chỉ có thể thêm bạn bè vào nhóm.", notFriends})
        }

        next();

    } catch (error) {
        console.error("Lỗi xảy ra khi checkFriendship: ", error);
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
}

export const checkGroupMembership = async (req, res, next) => {
    try {
        const {conversationId} = req.body;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);

        if(!conversation){
            return res.status(404).json({message: "Không tìm thấy cuộc trò chuyện"})
        }

        const isMember = conversation.participants.some(
            (p) => p.userId.toString() === userId.toString()
        )

        if(!isMember){
            return res.status(403).json({message: "Bạn không ở trong group này."})
        }

        req.conversation = conversation;

        next();
    } catch (error) {
        console.error("Lỗi checkGroupMembership: ", error);
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
}