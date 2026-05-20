# Moji

Moji là ứng dụng nhắn tin realtime được xây dựng với React, TypeScript, Node.js, Express, Socket.IO và MongoDB. Dự án hỗ trợ trò chuyện 1-1, chat nhóm, trạng thái online, thông báo đang nhập, số tin nhắn chưa đọc, gửi hình ảnh và quản lý hồ sơ người dùng.

## Tính Năng

- Đăng ký, đăng nhập, đăng xuất.
- Xác thực bằng access token và refresh token.
- Nhắn tin realtime bằng Socket.IO.
- Chat 1-1 giữa bạn bè.
- Tạo nhóm chat và nhắn tin nhóm.
- Hiển thị trạng thái online/offline.
- Hiển thị người dùng đang nhập tin nhắn.
- Lưu và hiển thị số tin nhắn chưa đọc.
- Đánh dấu đã xem khi người dùng mở cuộc trò chuyện.
- Gửi hình ảnh trong tin nhắn.
- Xem ảnh lớn khi bấm vào hình ảnh trong chat.
- Gửi, nhận, chấp nhận và từ chối lời mời kết bạn.
- Cập nhật ảnh đại diện.
- Xem ảnh đại diện khi bấm vào avatar.
- Cập nhật tên hiển thị, bio và số điện thoại.
- Đổi mật khẩu trong phần Profile & Settings.
- Phân trang lịch sử tin nhắn.
- Giới hạn request cơ bản cho đăng nhập, gửi tin, upload và thao tác bạn bè.

## Công Nghệ

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

## Cấu Trúc Dự Án

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
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   ├── vercel.json
│   └── package.json
├── .gitignore
└── README.md
```

## Yêu Cầu

- Node.js
- npm
- MongoDB database
- Cloudinary account

## Cài Đặt

Clone repository:

```bash
git clone https://github.com/Oanh1108/Moji.git
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

## Biến Môi Trường

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

## Chạy Local

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

Mở trình duyệt:

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

## Deploy

### Frontend trên Vercel

Cấu hình project Vercel:

```txt
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Biến môi trường production:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

File `frontend/vercel.json` dùng để rewrite route React Router về `index.html`, giúp các đường dẫn như `/signin` và `/signup` không bị 404 khi refresh.

### Backend trên Render

Cấu hình service Render:

```txt
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Biến môi trường production:

```env
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
MONGODB_CONNECTIONSTRING=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Nếu có nhiều frontend URL, có thể đặt `CLIENT_URL` dạng:

```env
CLIENT_URL=https://your-frontend-url.vercel.app,https://another-domain.com
```

## Tác Giả

Moji được phát triển bởi Oanh1108.
