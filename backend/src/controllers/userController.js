import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const authMe = async (req, res) => {
    try {
        const user = req.user; //lấy từ authMiddleware

        return res.status(200).json({user})
    } catch (error) {
         console.error('Lỗi khi gọi authMe', error);
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const {displayName, bio, phone} = req.body;

        const nextDisplayName = displayName?.trim();
        const nextBio = bio?.trim() ?? "";
        const nextPhone = phone?.trim() ?? "";

        if(!nextDisplayName){
            return res.status(400).json({message: "Tên hiển thị là bắt buộc"});
        }

        if(nextDisplayName.length > 80){
            return res.status(400).json({message: "Tên hiển thị tối đa 80 ký tự"});
        }

        if(nextBio.length > 500){
            return res.status(400).json({message: "Bio tối đa 500 ký tự"});
        }

        if(nextPhone.length > 30){
            return res.status(400).json({message: "Số điện thoại tối đa 30 ký tự"});
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                displayName: nextDisplayName,
                bio: nextBio,
                phone: nextPhone
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-hashedPassword");

        if(!updatedUser){
            return res.status(404).json({message: "Người dùng không tồn tại"});
        }

        return res.status(200).json({user: updatedUser});
    } catch (error) {
        console.error("Lỗi xảy ra khi cập nhật profile", error);
        return res.status(500).json({message: "Lỗi hệ thống"});
    }
}

export const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const {currentPassword, newPassword} = req.body;

        if(!currentPassword || !newPassword){
            return res.status(400).json({message: "Cần nhập đầy đủ mật khẩu hiện tại và mật khẩu mới"});
        }

        if(newPassword.length < 6){
            return res.status(400).json({message: "Mật khẩu mới phải có ít nhất 6 ký tự"});
        }

        if(currentPassword === newPassword){
            return res.status(400).json({message: "Mật khẩu mới phải khác mật khẩu hiện tại"});
        }

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message: "Người dùng không tồn tại"});
        }

        const passwordCorrect = await bcrypt.compare(currentPassword, user.hashedPassword);

        if(!passwordCorrect){
            return res.status(400).json({message: "Mật khẩu hiện tại không chính xác"});
        }

        user.hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({message: "Đổi mật khẩu thành công"});
    } catch (error) {
        console.error("Lỗi xảy ra khi đổi mật khẩu", error);
        return res.status(500).json({message: "Lỗi hệ thống"});
    }
}

export const searchUserByUsername = async (req, res) => {
    try {
        const {username} = req.query;

        if(!username || username.trim() === ""){
            return res.status(400).json({message: "Cần cung cấp username trong query."});
        }

        const user = await User.findOne({username}).select("_id displayName username avatarUrl");

        return res.status(200).json({user});
    } catch (error) {
        console.error("Lỗi xảy ra khi searchUserByUsername", error);
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
}

export const uploadAvatar = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user._id;

        if(!file){
            return res.status(400).json({message: "No file uploaded"})
        }

        const result = await uploadImageFromBuffer(file.buffer);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                avatarUrl: result.secure_url
            },
            {
                new: true,
            }
        ).select('avatarUrl');

        if(!updatedUser.avatarUrl) {
            return res.status(400).json({message: "Avatar trả về null"})
        }

        return res.status(200).json({avatarUrl: updatedUser.avatarUrl})

    } catch (error) {
        console.error("Lỗi xảy ra khi upload avatar", error);
        return res.status(500).json({message: 'Upload failed'})
    }
}
