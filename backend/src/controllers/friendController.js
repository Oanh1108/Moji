import Friend from '../models/Friend.js';
import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';
import Conversation from '../models/Conversastion.js'

export const sendFriendRequest = async (req, res) => {
    try {
        console.log("BODY FRIEND REQUEST:", req.body);
    console.log("USER LOGIN:", req.user?._id);

    const { to, message } = req.body;
    const from = req.user._id;

    if (!to) {
      return res.status(400).json({ message: "Thiếu người nhận lời mời" });
    }

    if (from.toString() === to.toString()) {
      return res.status(400).json({
        message: "Không thể gửi lời mời kết bạn cho chính mình"
      });
    }
        //Kiểm tra xem người nhận lời mời có trong db không
        const userExists = await User.exists({_id: to});

        if(!userExists){
            return res.status(404).json({message: "Người dùng không tồn tại!"})
        }

        //Kiểm tra xem giữa 2 người có mối quan hệ nào chưa
        //VD: đã là bạn bè hoặc đã có lời mời đang chờ

        //Đổi 2 user thành string để dễ so sánh
        let userA = from.toString();
        let userB = to.toString();

        if(userA > userB){
            [userA, userB] = [userB, userA];
        }
        //Viết 2 query song song tạo 2 biến để lưu giá trị về.
        //Chạy 2 query cùng lúc bằng promise => Tiết kiệm thời gian
        const [alreadyFriends, existingRequest] = await Promise.all([
            Friend.findOne({userA, userB}), //Kiểm tra 2 người đã là bạn chưa
            FriendRequest.findOne({ //Xem 2 người này đã gửi lời mời kết bạn chưa, bất kể người gửi là ai
                $or: [
                    {from, to},
                    {from: to, to: from}
                ]
            })
        ])
         
        //Sau khi 2 query hoàn tất thì ktr kết quả
        if(alreadyFriends){
            return res.status(400).json({message: 'Hai người đã là bạn bè'})
        }

        if(existingRequest) {
            return res.status(400).json({message: 'Đã có lời mời kết bạn đang chờ'})
        }

        //Tạo 1 lời mời kết bạn
        const request = await FriendRequest.create({
            from,
            to,
            message
        })

        return res.status(201).json({message: 'Gửi lời mời kết bạn thành công', request})

    } catch (error) {
        console.error("Lỗi khi gửi lời mời kết bạn", error);
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const {requestId} = req.params;
        const userId = req.user._id;

        //Tìm lời mời kết bạn có tồn tại không
        const request = await FriendRequest.findById(requestId);

        if(!request) {
            return res.status(404).json({message: "Không tìm thấy lời mời kết bạn"})
        }

        //Đảm bảo chỉ người nhận mới được quyền chấp nhận
        if(request.to.toString() !== userId.toString()) { //Không phải là người mời
            return res.status(403)
            .json({message: 'Bạn không có quyền chấp nhận lời mời này'})
        }

        // Tạo mối quan hệ bạn bè mới
        const friend = await Friend.create({
            userA: request.from,
            userB: request.to
        })

        // Tạo cuộc trò chuyện 1-1 cho 2 người vừa kết bạn
        const conversation = await Conversation.create({
            type: "direct",
            participants: [
                { userId: request.from },
                { userId: request.to },
            ],
            lastMessage: null,
            seenBy: [],
            unreadCounts: {
                [request.from.toString()]: 0,
                [request.to.toString()]: 0,
            },
        })

        // Chấp nhận rồi thì xóa lời mời đi
        await FriendRequest.findByIdAndDelete(requestId);

        //Lấy thông tin người gửi lời mời để trả về cho client hiển thị trong giao diện
        //select để chỉ lấy những trường cần thiết
        //.lean() để tối ưu hiệu năng của query. Có lean() thì dữ liệu trả về
        // là JS object thay vì mongo document => query nhanh và nhẹ hơn
        const from = await User.findById(request.from).select(
            "_id displayName avatarUrl"
        ).lean();

        return res.status(200).json({
            message: "Chấp nhận lời mời kết bạn thành công",
            newFriend: {
                _id: from?._id,
                displayName: from?.displayName,
                avatarUrl: from?.avatarUrl
            },
            conversation
        })

    } catch (error) {
    console.error("Lỗi khi chấp nhận lời mời kết bạn", error);
    return res.status(500).json({
        message: "Lỗi hệ thống",
        error: error.message
    });
}
}

export const declineFriendRequest = async (req, res) => {
    try {
        //Lấy id của lời mời kết bạn mà client gửi lên
        const {requestId} = req.params;
        const userId = req.user._id;

        //Kiểm tra người đang gửi request này là ai
        const request = await FriendRequest.findById(requestId); //tÌM lời mời kết bạn theo id
        
        //Kiểm tra xem request có tồn tại không
        if(!request){
            res.status(404).json({message: "Không tìm thấy lời mời kết bạn"})
        }

        //Đảm bảo người nhận lời mời mới có thể từ chối
        if(request.to.toString() !== userId.toString()) {
            return res.status(403).json({message: 'Bạn không có quyền từ chối lời mời này'})
        }

        //Từ chối rồi, thì xóa lời mời đi
        await FriendRequest.findByIdAndDelete(requestId);

        return res.sendStatus(204);
    } catch (error) {
        console.error("Lỗi khi từ chối lời mời kết bạn", error);
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
}

export const getAllFriends = async (req, res) => {
    try {
        const userId  = req.user._id; //Object này được gắn sẵn nhờ middleware protected root. Sau đó gửi truy vấn tới mongodb để lấy danh sách các bạn
        
        const friendships = await Friend.find({
            //để tìm all các mối quan hệ bạn bè mà user đang ở 1 trong 2 phía
            //tức là userA hoặc userB thì dùng toán tử or
            $or: [
                {
                    userA: userId
                },
                {
                    userB: userId
                }
            ]
            //dùng hàm populate() để lấy thông tin chi tiết
        }).populate("userA", "_id displayName avatarUrl username")
        .populate("userB", "_id displayName avatarUrl username")
        .lean();

        if(!friendships.length){
            return res.status(200).json({friends: []})
        }

        //Nếu friendship không phải mãng rỗng nghĩa là người dùng này có bạn bè
        //thì mình cần lấy bạn bè từ friendship

        //Hiện tại, chúng ta không biết được userA hay userB mới là bạn. Cho nên
        //dùng map để duyệt qua từng mối quan hệ
        const friends = friendships.map((f) => 
            f.userA._id.toString() === userId.toString() ? f.userB : f.userA
        );

        return res.status(200).json({friends})
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè", error);
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
}

export const getFriendRequests = async (req, res) => {
    try {
        // Lấy id của người đang đăng nhập từ middleware auth
        const userId = req.user._id;

        // Khai báo các field muốn lấy khi dùng populate
        // Chỉ lấy những thông tin cần thiết của user để trả về cho client
        const populateFields = '_id username displayName avatarUrl';

        // Chạy 2 query song song để tối ưu thời gian
        const [sent, received] = await Promise.all([
            // Lấy các lời mời kết bạn mà người đang đăng nhập đã gửi cho người khác
            // populate("to") để lấy thông tin chi tiết của người nhận lời mời
            FriendRequest.find({ from: userId }).populate("to", populateFields),

            // Lấy các lời mời kết bạn mà người đang đăng nhập nhận được từ người khác
            // populate("from") để lấy thông tin chi tiết của người gửi lời mời
            FriendRequest.find({ to: userId }).populate("from", populateFields)
        ]);

        res.status(200).json({sent, received});

    } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu cầu kết bạn", error);
        return res.status(500).json({message: "Lỗi hệ thống", error: error.message})
    }
}