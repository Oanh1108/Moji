import type {UserState} from '@/types/store'
import {create} from 'zustand'
import { useAuthStore } from './useAuthStore'
import { userService } from '@/services/userService';
import { toast } from 'sonner';
import { useChatStore } from './useChatStore';

export const useUserStore = create<UserState>(() => ({
    updateAvatarUrl: async (formData) => {
        try {
            const {user, setUser} = useAuthStore.getState();
            const data = await userService.uploadAvatar(formData);

            if(user) {
                setUser({
                    ...user,
                    avatarUrl: data.avatarUrl
                });

                useChatStore.getState().fetchConversations();
            }
        } catch (error) {
            console.error("Lỗi khi updateAvatarUrl", error);
            toast.error("Upload avatar không thành công!")
        }
    },

    updateProfile: async (payload) => {
        try {
            const {setUser} = useAuthStore.getState();
            const user = await userService.updateProfile(payload);

            setUser(user);
            await useChatStore.getState().fetchConversations();
            toast.success("Cập nhật profile thành công!");
        } catch (error) {
            console.error("Lỗi khi updateProfile", error);
            toast.error("Cập nhật profile không thành công!");
            throw error;
        }
    },

    changePassword: async (payload) => {
        try {
            await userService.changePassword(payload);
            toast.success("Đổi mật khẩu thành công!");
        } catch (error) {
            console.error("Lỗi khi changePassword", error);
            toast.error("Đổi mật khẩu không thành công!");
            throw error;
        }
    }
}))
