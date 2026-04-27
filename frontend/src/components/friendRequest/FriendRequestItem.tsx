import type { FriendRequest } from "@/types/user"
import type { ReactNode } from "react";
import UserAvatar from "../chat/UserAvatar";

interface RequestItemProps {
    requestInfo: FriendRequest;
    actions: ReactNode;
    type: "sent" | "received";
}

const FriendRequestItem = ({requestInfo, actions, type}: RequestItemProps) => {
    if(!requestInfo){
        return;
    }
    const info = type === "sent" ? requestInfo.to : requestInfo.from;

    if(!info){
        return;
    }
    
  return (
    <div className="w-full flex items-center justify-between rounded-xl border bg-background p-3 shadow-sm">
        <div className="flex items-center gap-3">
        <UserAvatar
            type="sidebar"
            name={info.displayName}
        />
        <div>
            <p className="font-medium">{info.displayName}</p>
            <p className="text-sm text-muted-foreground">@{info.username}</p>
        </div>
      </div>
      {actions}
    </div>
  )
}

export default FriendRequestItem
