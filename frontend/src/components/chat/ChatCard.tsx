import {Card} from "@/components/ui/card";
import { formatOnlineTime, cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";


interface ChatCardProps {
  // ID của cuộc trò chuyện
  // Dùng để biết user đang bấm vào đoạn chat nào
  convoId: string;

  // Tên hiển thị của cuộc trò chuyện
  // Ví dụ: tên bạn bè hoặc tên nhóm chat
  name: string;

  // Thời gian tin nhắn cuối cùng
  // Dấu ? nghĩa là có cũng được, không có cũng được
  timestamp?: Date;

  // Cuộc trò chuyện này có đang được chọn không
  // true = đang mở
  // false = chưa mở
  isActive: boolean;

  // Hàm chạy khi user bấm vào chat card
  // Nó nhận vào id của cuộc trò chuyện
  onSelect: (id: string) => void;

  // Số tin nhắn chưa đọc
  // Có thể không có nên dùng dấu ?
  unreadCount?: number;

  // Phần bên trái của card
  // Thường là avatar hoặc icon nhóm
  leftSection: React.ReactNode;

  // Dòng mô tả bên dưới tên
  // Thường là tin nhắn cuối cùng
  subtitle: React.ReactNode;
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount,
  leftSection,
  subtitle,
}: ChatCardProps) => {
  return (
    <Card
      // key dùng để React nhận diện từng card
      key={convoId}

      className={cn(
        // Class mặc định của card
        // border-none: bỏ viền
        // p-3: padding bên trong
        // cursor-pointer: rê chuột hiện bàn tay
        // hover:bg-muted/30: hover thì đổi nền nhẹ
        "border-none p-3 cursor-pointer transition-smooth glass hover:bg-muted/30",

        // Nếu card này đang được chọn thì thêm viền sáng và nền gradient
        isActive &&
          "ring-2 ring-primary/50 bg-gradient-to-tr from-primary-glow/10 to-primary-foreground"
      )}

      // Khi click vào card, gọi hàm onSelect và truyền id cuộc trò chuyện
      onClick={() => onSelect(convoId)}
    >
      <div className="flex items-center gap-3">
        {/* Phần bên trái: avatar hoặc icon nhóm */}
        <div className="relative">{leftSection}</div>

        {/* Phần nội dung bên phải */}
        <div className="flex-1 min-w-0">
          {/* Hàng đầu: tên cuộc trò chuyện + thời gian */}
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                // Tên chat: đậm vừa, nhỏ, dài thì hiện ...
                "font-semibold text-sm truncate",

                // Nếu có tin nhắn chưa đọc thì đổi màu chữ rõ hơn
                unreadCount && unreadCount > 0 && "text-foreground"
              )}
            >
              {name}
            </h3>

            {/* Nếu có timestamp thì format thời gian, không có thì để rỗng */}
            <span className="text-xs text-muted-foreground">
              {timestamp ? formatOnlineTime(timestamp) : ""}
            </span>
          </div>

          {/* Hàng dưới: tin nhắn cuối cùng + nút ba chấm */}
          <div className="flex items-center justify-between">
            {/* subtitle thường là tin nhắn cuối cùng */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {subtitle}
            </div>

            {/* Icon ba chấm: mặc định ẩn, hover vào card cha thì hiện */}
            <MoreHorizontal
              className="size-4 text-muted-foreground opacity-0 
              group-hover:opacity-100 hover:size-5 transition-smooth"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard
