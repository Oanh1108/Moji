# Moji

Moji là ứng dụng chat realtime được xây dựng với React, Node.js, Express, Socket.IO và MongoDB. Dự án hỗ trợ nhắn tin trực tiếp, chat nhóm, trạng thái online, typing indicator, lời mời kết bạn, gửi hình ảnh, xem ảnh trong chat, chỉnh sửa hồ sơ cá nhân và đổi mật khẩu.

## Tính năng chính

- Đăng ký, đăng nhập, đăng xuất.
- Xác thực bằng access token và refresh token.
- Chat realtime bằng Socket.IO.
- Nhắn tin 1-1 giữa bạn bè.
- Tạo nhóm chat và gửi tin nhắn nhóm.
- Gửi hình ảnh trong tin nhắn.
- Bấm vào hình ảnh để xem ảnh lớn.
- Hiển thị người dùng online/offline.
- Hiển thị trạng thái đang nhập tin nhắn.
- Gửi, nhận, chấp nhận và từ chối lời mời kết bạn.
- Cập nhật ảnh đại diện.
- Xem ảnh đại diện khi bấm vào avatar.
- Cập nhật tên hiển thị, bio và số điện thoại.
- Đổi mật khẩu trong phần Profile & Settings.
- Phân trang lịch sử tin nhắn.
- Giới hạn spam request cơ bản cho đăng nhập, gửi tin nhắn, upload và thao tác bạn bè.

## Công nghệ sử dụng

### Frontend

- React
- TypeScript
- Vite
- Zustand
- Axios
- Socket.IO Client
- Tailwind CSS
- shadcn/base-ui components
- Lucide React

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcrypt
- Multer
- Cloudinary

## Cấu trúc thư mục

```txt
Moji/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── libs/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   └── package.json
└── README.md
```

## Yêu cầu trước khi chạy

- Node.js
- npm
- MongoDB database
- Cloudinary account

## Cài đặt

Clone project:

```bash
git clone <repository-url>
cd Moji
```

Cài backend:

```bash
cd backend
npm install
```

Cài frontend:

```bash
cd ../frontend
npm install
```

## Cấu hình biến môi trường

Tạo file `backend/.env`:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_CONNECTIONSTRING=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Tạo file `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

Không commit file `.env` thật lên GitHub.

## Chạy project ở local

Chạy backend:

```bash
cd backend
npm run dev
```

Chạy frontend ở terminal khác:

```bash
cd frontend
npm run dev
```

Mở trình duyệt tại:

```txt
http://localhost:5173
```

## Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Tác giả

Moji được phát triển bởi Oanh1108.
