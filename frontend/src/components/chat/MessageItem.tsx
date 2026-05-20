import { useState } from "react";
import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface MessageItemProps {
    message: Message;
    index: number;
    messages: Message[];
    selectedConvo: Conversation;
    lastMessageStatus: "delivered" | "seen";
}

const MessageItem = ({message, index, messages, selectedConvo, lastMessageStatus} : MessageItemProps) => {
    const [imageOpen, setImageOpen] = useState(false);
    const prev = index + 1 < messages.length ? messages[index - 1] : undefined;

    const isShowTime = index === 0 ||
        new Date(message.createdAt).getTime() - new Date(prev?.createdAt || 0).getTime()
        - new Date(prev?.createdAt || 0).getTime() > 300000; //5 phut

    const isGroupBreak = isShowTime || message.senderId !== prev?.senderId;
    const participants = selectedConvo.participants.find((p: Participant) => p._id.toString() === message.senderId.toString())

  return (
    <>
        {isShowTime && (
        <div className="w-full flex justify-center my-2">
            <span className="text-xs text-muted-foreground px-1">
            {formatMessageTime(new Date(message.createdAt))}
            </span>
        </div>
        )}

      <div className={cn("flex gap-2 message-bounce mt-1", 
        message.isOwn ? "justify-end" : "justify-start"
    )}>
      {!message.isOwn && (
        <div>
            {isGroupBreak && (
                <UserAvatar
                    type="chat"
                    name={participants?.displayName ?? "Moji"}
                    avatarUrl={participants?.avatarUrl ?? undefined}
                />
            )}
        </div>
      )}

      <div className={cn("max-w-xs lg:max-w-md space-y-1 flex flex-col",
        message.isOwn ? "items-end" : "items-start"
      )}>
        <Card className={cn("overflow-hidden p-2", message.isOwn ? "chat-bubble-sent border-0" : "bg-chat-bubble-received")}>
            {message.imgUrl && (
                <>
                    <button
                        type="button"
                        onClick={() => setImageOpen(true)}
                        className="block max-w-full cursor-zoom-in overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <img
                            src={message.imgUrl}
                            alt="Ảnh trong tin nhắn"
                            className="max-h-80 w-full rounded-md object-cover transition-transform hover:scale-[1.01]"
                        />
                    </button>

                    <Dialog open={imageOpen} onOpenChange={setImageOpen}>
                        <DialogContent
                            showCloseButton={false}
                            className="w-fit max-w-[calc(100vw-1rem)] border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-[calc(100vw-1rem)]"
                        >
                            <DialogTitle className="sr-only">
                                Xem ảnh trong tin nhắn
                            </DialogTitle>
                            <DialogClose
                                render={
                                    <Button
                                        variant="secondary"
                                        size="icon-sm"
                                        className="absolute right-2 top-2 z-10 bg-background/90 shadow-md"
                                    />
                                }
                            >
                                <X className="size-4" />
                                <span className="sr-only">Đóng</span>
                            </DialogClose>
                            <img
                                src={message.imgUrl}
                                alt="Ảnh trong tin nhắn"
                                className="max-h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)] rounded-md object-contain"
                            />
                        </DialogContent>
                    </Dialog>
                </>
            )}
            {message.content && (
                <p className={cn("text-sm leading-relaxed break-words", message.imgUrl && "mt-2 px-1")}>
                    {message.content}
                </p>
            )}
        </Card>
      </div>

      {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
        <Badge
            variant="outline"
            className={cn(
                "text-xs px-1.5 py-0.5 h-4 border-0",
                lastMessageStatus === "seen"
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
        >
            {lastMessageStatus}
        </Badge>
      ) }

    </div>
    </>
  )
}

export default MessageItem
