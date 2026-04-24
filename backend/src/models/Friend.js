import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
    userA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{
    timestamps: true
})

//Để chuẩn hóa thứ tự userA và userB thì cần 1 cái middleware. Ở trong MongoDB
// thì cái này gọi là pre. Đoạn này sẽ chạy trước khi lưu dữ liệu vào database

friendSchema.pre('save', function () {
    //save có nghĩa là trước khi thực hiện hành động save thì sẽ thực hiện
    //logic trong function (next) => function (next) là 1 hàm gọi lại

    //Lấy id của userA và userB
    const a = this.userA.toString();
    const b = this.userB.toString();

    //So sánh 2 id, nếu a > b thì sẽ hoán đổi lại
    if(a > b){
        this.userA  = new mongoose.Types.ObjectId(b);
        this.userB = new mongoose.Types.ObjectId(a);
    }
})

//Tạo index độc nhất cho cặp userA và userB đảm bảo không bị trùng 
friendSchema.index({userA: 1, userB:1}, {unique: true});

const Friend = mongoose.model("Friend", friendSchema);
export default Friend;