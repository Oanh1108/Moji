import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        maxLength: 300
    }
},{
    timestamps: true
})

//Để không cho phép gửi trùng lời mời => index này sẽ đảm bảo cặp from và to 
//là duy nhất. Nếu cố gửi lời mời đến cùng 1 người thì mongdb sẽ báo lỗi
friendRequestSchema.index({from:1, to:1}, {unique: true})


//Để truy vấn nhanh tất cả lời mời kết bạn đã gửi
friendRequestSchema.index({from:1})

//Để truy vấn nhanh tất cả lời mời kết bạn đã nhận
friendRequestSchema.index({to:1})

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
export default FriendRequest;