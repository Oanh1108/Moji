import { useAuthStore } from '@/stores/useAuthStore'
import { useChatStore } from '@/stores/useChatStore'
import type { Conversation } from '@/types/chat'
import ChatCard from './ChatCard'
import UnreadCountBadge from './UnreadCountBadge'
import GroupChatAvatar from './GroupChatAvatar'

// Component này dùng để hiển thị 1 card nhóm chat
const GroupChatCard = ({ convo }: { convo: Conversation }) => {
  // Lấy thông tin user đang đăng nhập
  const { user } = useAuthStore()

  // Lấy dữ liệu chat từ store
  const { activeConversationId, setActiveConversation, messages, fetchMessages, markAsSeen } = useChatStore()
  // Nếu chưa có user thì không hiển thị gì cả
  if (!user) return null

  // Lấy số tin nhắn chưa đọc của user hiện tại trong nhóm này
  const unreadCount = convo.unreadCounts?.[user._id] ?? 0

  // Lấy tên nhóm chat
  // Nếu chưa có tên nhóm thì dùng chuỗi rỗng ""
  const name = convo.group?.name ?? ""

  // Hàm này chạy khi user click vào card nhóm chat
  const handleSelectConversation = async (id: string) => {
  setActiveConversation(id)

  await markAsSeen() 

  if (!messages[id]) {
    await fetchMessages(id)
  }
}

  return (
    <div>
      <ChatCard
        // ID của cuộc trò chuyện
        convoId={convo._id}

        // Tên nhóm chat
        name={name}

        // Thời gian tin nhắn cuối cùng
        // Nếu có lastMessage thì chuyển createdAt thành Date
        // Nếu không có thì để undefined
        timestamp={
          convo.lastMessage?.createdAt
            ? new Date(convo.lastMessage.createdAt)
            : undefined
        }

        // Kiểm tra card này có đang được chọn không
        isActive={activeConversationId === convo._id}

        // Khi click vào card thì gọi hàm chọn conversation
        onSelect={handleSelectConversation}

        // Số tin nhắn chưa đọc
        unreadCount={unreadCount}

        // Phần bên trái card
        // Sau này có thể đặt avatar nhóm hoặc icon nhóm ở đây
        leftSection={<>
          {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount}/>}
          <GroupChatAvatar
            participants={convo.participants}
            type='chat'
          />
        </>}

        // Dòng mô tả bên dưới tên nhóm
        subtitle={
          <p className="text-sm truncate text-muted-foreground">
            {convo.participants.length} thành viên
          </p>
        }
      />
    </div>
  )
}

export default GroupChatCard

// 🟡 ? : (if ngắn gọn)
// const text = unreadCount > 0 ? "Có tin nhắn" : "Không có"
// // Nếu unreadCount > 0 → "Có tin nhắn"
// // Ngược lại → "Không có"

// 👉 Dùng khi: có điều kiện đúng / sai

// 🔵 ?. (có thì lấy, không thì thôi)
// const name = convo.group?.name
// // Nếu group có tồn tại → lấy name
// // Nếu không có → undefined (không bị lỗi)

// 👉 Dùng khi: sợ bị undefined / null

// 🟢 ?? (giá trị mặc định)
// const name = convo.group?.name ?? "Chưa có tên"
// // Nếu name có giá trị → dùng nó
// // Nếu null hoặc undefined → dùng "Chưa có tên"

// 👉 Dùng khi: muốn fallback (giá trị thay thế)

// 🧠 So sánh siêu dễ nhớ
// ?.  = có thì lấy
// ??  = không có thì dùng mặc định
// ? : = nếu đúng thì A, sai thì B
// 🔥 Ví dụ trong code của bạn
// const unreadCount = convo.unreadCounts?.[user._id] ?? 0
// Nếu unreadCounts tồn tại → lấy số unread
// Nếu không → dùng 0
