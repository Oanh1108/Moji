import { useFriendStore } from "@/stores/useFriendStore";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { UserPlus, Users } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "@base-ui/react";
import InviteSuggestionList from "../newGroupChat/InviteSuggestionList";
import type { Friend } from "@/types/user";
import SelectedUsersList from "../newGroupChat/SelectedUsersList";
import { toast } from "sonner";
import { useChatStore } from "@/stores/useChatStore";

const NewGroupChatModal = () => {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const {friends, getFriends} = useFriendStore();
  const [invitedUsers, setInvitedUsers] = useState<Friend[]>([]);
  const {loading, createConversation} = useChatStore(); 

  const handleGetFriends = async () => {
    await getFriends();
  };

  const handleSelectFriend = (friend: Friend) => {
    setInvitedUsers([...invitedUsers, friend]);
    setSearch("");
  }

  const handleRemoveFriend  = (friend: Friend) => {
    setInvitedUsers(invitedUsers.filter((u) => u._id !== friend._id));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if(invitedUsers.length === 0) {
        toast.warning("Bạn phải mời ít nhất 1 thành viên vào nhóm");
        return;
      }

      await createConversation(
        'group',
        groupName,
        invitedUsers.map((u) => u._id)
      );

      setSearch('');
      setInvitedUsers([]);
    } catch (error) {
      console.error("Lỗi xảy ra khi handleSubmit trong NewGroupChatModal: ", error);
      
    }
  }

   const filteredFriends = friends.filter(
    (friend) => 
      friend.displayName.toLowerCase().includes(search.toLowerCase()) &&
    !invitedUsers.some((u) => u._id === friend._id)
   )


  return (
    <Dialog>
      <DialogTrigger>
        <Button 
        variant='ghost'
        onClick={handleGetFriends}
        className='flex z-10 justify-center items-center size-5 rounded-full 
        hover:bg-sidebar-accent transition cursor-pointer'>
          <Users className="size-4"/>
          <span className="sr-only">Tạo nhóm</span>
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[425px] border-none'>
        <DialogHeader>
          <DialogTitle className='capitalize'>
            Tạo nhóm chat mới
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4"
        onSubmit={handleSubmit}>
          {/* tên nhóm */}
          <div className="space-y-2">
            <Label
            htmlFor="groupName"
            className="text-sm font-semibold">
              Tên nhóm
            </Label>

            <Input
              id='groupName'
              className="rounded-2xl glass border-border/50 focus:border-primary/50 transition-smooth"
              placeholder='Gõ tên nhóm vào đây...'
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />

          </div>

          {/* mời thành viên */}
          <div className="space-y-2">
            <Label
            htmlFor="invite"
            className="text-sm font-semibold ">
              Mời thành viên
            </Label>

            <Input
              id='invite'
              placeholder="Tìm theo tên hiển thị..."
              value={search}
              className='rounded-2xl'
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* ds gợi ý */}
          {search && filteredFriends.length > 0 && (
            <InviteSuggestionList
            filteredFriends={filteredFriends}
            onSelect={handleSelectFriend}
          />
          )}

          {/* ds user đã chọn */}
          <SelectedUsersList
            invitedUsers={invitedUsers}
            onRemove={handleRemoveFriend}
          />

          <DialogFooter>
            <Button 
              type="submit"
              disabled={loading}
              className='flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth'
            >
              {
                loading ? (
                  <span>Đang tạo...</span>
                ) : (
                  <>
                    <UserPlus className="size-4 mr-2"/>
                    Tạo nhóm
                  </>
                )
              }
            </Button>
          </DialogFooter>

        </form>

      </DialogContent>
    </Dialog>
  )
}

export default NewGroupChatModal
