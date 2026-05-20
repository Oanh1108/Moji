import { useAuthStore } from "@/stores/useAuthStore"
import type { Conversation } from "@/types/chat";
import { Button } from "../ui/button";
import { ImagePlus, Send, X } from "lucide-react";
import { Input } from "../ui/input";
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";
import { useSocketStore } from "@/stores/useSocketStore";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const MessageInput = ({selectedConvo} : {selectedConvo: Conversation}) => {

  const {user} = useAuthStore();
  const {sendDirectMessage, sendGroupMessage, markAsSeen} = useChatStore();
  const {socket} = useSocketStore();
  const [value, setValue] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const lastTypingAtRef = useRef(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if(imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    }
  }, [imagePreview])

  if(!user) return null;

  const clearImage = () => {
    if(imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);

    if(imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if(!file) return;

    if(!file.type.startsWith("image/")) {
      toast.error("Chỉ có thể gửi file ảnh");
      e.target.value = "";
      return;
    }

    if(file.size > MAX_IMAGE_SIZE) {
      toast.error("Ảnh phải nhỏ hơn 5MB");
      e.target.value = "";
      return;
    }

    if(imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  const sendMessage = async () => {
    if ((!value.trim() && !selectedImage) || sending) return;

    const currValue = value.trim();
    const currImage = selectedImage ?? undefined;

    try {
      setSending(true);

      if(selectedConvo.type === 'direct'){
        const participants = selectedConvo.participants;
        const otherUser = participants.filter((p) => p._id !== user._id)[0];
        await sendDirectMessage(otherUser._id, currValue, currImage);
      }else{
        await sendGroupMessage(selectedConvo._id, currValue, currImage)
      }

      setValue("");
      clearImage();
    } catch (error) {
      console.error(error);
      toast.error("Không thể gửi tin nhắn. Bạn hãy thử lại!");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
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

    socket.emit("typing", {
      conversationId: selectedConvo._id,
    });
  }

  const handleInputFocus = () => {
    if(selectedConvo.type !== "direct") return;
    markAsSeen(selectedConvo._id);
  }

  const canSend = !!value.trim() || !!selectedImage;

  return (
    <div className="bg-background p-3">
      {imagePreview && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative size-20 overflow-hidden rounded-md border bg-muted">
            <img
              src={imagePreview}
              alt="Ảnh sẽ gửi"
              className="size-full object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon-xs"
              onClick={clearImage}
              className="absolute right-1 top-1 bg-background/90"
            >
              <X className="size-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex min-h-[56px] items-center gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <Button
          type="button"
          variant='ghost'
          size='icon'
          onClick={() => imageInputRef.current?.click()}
          className='hover:bg-primary/10 transition-smooth'
        >
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
                type="button"
                variant='ghost'
                className='size-8 hover:bg-primary/10 transition-smooth resize-none'
              >
                <div>
                  <EmojiPicker onChange={(emoji: string) => setValue(`${value}${emoji}`)}/>
                </div>
              </Button>
            </div>
        </div>
        <Button
            type="button"
            onClick={sendMessage} 
            className='bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105' 
            disabled={!canSend || sending}>
              <Send className="size-4 text-white"/>
        </Button>
      </div>
    </div>
  )
}
