import { useAuthStore } from "@/stores/useAuthStore"
import type { Conversation } from "@/types/chat";
import { Button } from "../ui/button";
import { ImagePlus, Send } from "lucide-react";
import { Input } from "../ui/input";
import { useRef, useState } from "react";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";
import { useSocketStore } from "@/stores/useSocketStore";


export const MessageInput = ({selectedConvo} : {selectedConvo: Conversation}) => {

  const {user} = useAuthStore();
  const {sendDirectMessage, sendGroupMessage, markAsSeen} = useChatStore();
  const {socket} = useSocketStore();
  const [value, setValue] = useState("")
  const lastTypingAtRef = useRef(0);

  if(!user) return;

  const sendMessage = async () => {
    if (!value.trim()) return;
    const currValue = value;
    setValue("");

    try {
      if(selectedConvo.type === 'direct'){
        const participants = selectedConvo.participants;
        const otherUser = participants.filter((p) => p._id !== user._id)[0];
        await sendDirectMessage(otherUser._id, currValue);
      }else{
        await sendGroupMessage(selectedConvo._id, currValue)
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xảy ra khi gửi tin nhắn. Bạn hãy thử lại!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if(e.key === 'Enter'){
      e.preventDefault();
      sendMessage();
    }
  }

  const emitTyping = () => {
    if(selectedConvo.type !== "direct" || !socket) return;

    const now = Date.now();
    if(now - lastTypingAtRef.current < 800) return;

    lastTypingAtRef.current = now;
    console.log("CLIENT emit typing", {
      conversationId: selectedConvo._id,
      userId: user._id,
    });

    socket.emit("typing", {
      conversationId: selectedConvo._id,
    });
  }

  const handleInputFocus = () => {
    if(selectedConvo.type !== "direct") return;
    markAsSeen(selectedConvo._id);
  }

  return (
    <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background">
      <Button variant='ghost' size='icon' className='hover:bg-primary/10 transition-smooth'>
        <ImagePlus className="size-4"/>
      </Button>

      <div className="flex-1 relative">
        <Input 
          onKeyDown={handleKeyPress}
          onFocus={handleInputFocus}
          onClick={handleInputFocus}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            emitTyping();
          }}
          placeholder="Soạn tin nhắn..."
          className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
        ></Input>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button
              variant='ghost'
              className='size-8 hover:bg-primary/10 transition-smooth resize-none'
            >
              <div>
                {/* emoji picker */}
                <EmojiPicker onChange={(emoji: string) => setValue(`${value}${emoji}`)}/>
              </div>
            </Button>
          </div>
      </div>
      <Button
          onClick={sendMessage} 
          className='bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105' 
          disabled={!value.trim()}>
            <Send className="size-4 text-white"/>
      </Button>
    </div>
  )
}
