import { useState } from "react";
import { X } from "lucide-react";
import type { User } from "@/types/user";
import { Card, CardContent } from "../ui/card";
import UserAvatar from "../chat/UserAvatar";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useSocketStore } from "@/stores/useSocketStore";
import AvatarUploader from "./AvatarUploader";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface ProfileCardProps {
    user: User | null;
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const {onlineUsers} = useSocketStore();
  if (!user) return null;

  const bio = user.bio || "Will code for food";
  const isOnline = onlineUsers.includes(user._id);

  return (
    <Card className="overflow-hidden p-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-none">
      <CardContent className="min-h-32 p-4 flex items-center gap-4 sm:flex-row sm:items-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => user.avatarUrl && setAvatarOpen(true)}
            disabled={!user.avatarUrl}
            className={cn(
              "rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              user.avatarUrl && "cursor-zoom-in"
            )}
          >
            <UserAvatar
              type="profile"
              name={user.displayName}
              avatarUrl={user.avatarUrl ?? undefined}
              className="ring-4 ring-white shadow-lg"
            />
          </button>
          <AvatarUploader/>

          {user.avatarUrl && (
            <Dialog open={avatarOpen} onOpenChange={setAvatarOpen}>
              <DialogContent
                showCloseButton={false}
                className="w-fit max-w-[calc(100vw-1rem)] border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-[calc(100vw-1rem)]"
              >
                <DialogTitle className="sr-only">
                  Xem ảnh đại diện
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
                  src={user.avatarUrl}
                  alt={`Ảnh đại diện của ${user.displayName}`}
                  className="max-h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)] rounded-md object-contain"
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {user.displayName}
          </h1>

          <p className="text-white/70 text-sm mt-2 max-w-lg line-clamp-2">
            {bio}
          </p>
        </div>

        <Badge className={cn('flex items-center gap-1 capitalize',
            isOnline ? "bg-green-100 text-green-700":"bg-slate-100 text-slate-700"
        )}>
          <div className={cn('size-2 rounded-full animate-pulse',
            isOnline ? "bg-green-500" : "bg-slate-500"
          )} />
          {isOnline ? "online" : "offline"}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default ProfileCard
