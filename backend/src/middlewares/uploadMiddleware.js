import multer from 'multer'
import {v2 as cloudinary} from 'cloudinary'

const imageFileFilter = (req, file, cb) => {
    if(!file.mimetype?.startsWith("image/")){
        return cb(new Error("Chỉ được upload file ảnh"));
    }

    cb(null, true);
}

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 1,
    },
    fileFilter: imageFileFilter
});

export const messageImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: imageFileFilter
});

export const uploadSingleMessageImage = (req, res, next) => {
    messageImageUpload.single("image")(req, res, (error) => {
        if(!error) {
            return next();
        }

        if(error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({message: "Ảnh phải nhỏ hơn 5MB"});
        }

        return res.status(400).json({message: error.message || "Upload ảnh không hợp lệ"});
    });
}

export const uploadImageFromBuffer = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: "moji_chat/avatars",
            resource_type: 'image',
            transformation: [{width: 200, height: 200, crop:'fill'}],
            ...options,
        },
        (error, result) => {
                if(error) {
                    reject(error);
                }else{
                    resolve(result);
                }
        });
            uploadStream.end(buffer);
        })
}
