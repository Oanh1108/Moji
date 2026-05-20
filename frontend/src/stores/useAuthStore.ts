import {create} from 'zustand'
import {toast} from 'sonner'
import { authService } from '@/services/authService'
import type { AuthState } from '@/types/store'
import { persist } from 'zustand/middleware'
import { useChatStore } from './useChatStore'

export const useAuthStore = create<AuthState>()(
    persist((set, get) => ({
    accessToken: null,
    user: null,
    loading: false,

    setAccessToken(accessToken) {
        set({accessToken})
    },

    setUser: (user) => {
        set({user});
    },

    clearState: () => {
        //Mục đích của hàm này là tái sử dụng nhiều lần
    //VD: sau khi logout hoặc token hết hạn, chỉ cần gọi clear token là 
    //toàn bộ thông tin user sẽ được xóa
        set({accessToken: null, user: null, loading: false})
        // Khi sử dụng local storage nếu người dùng logout hoặc app cần
        // reset do lỗi thì phải xóa dữ liệu lưu lại trong local storage.
        // Nếu không, dữ liệu của user trước có thể bị dùng lại khi người 
        // khác đăng nhập trên cùng 1 máy tính
        useChatStore.getState().reset();
        localStorage.clear();
        sessionStorage.clear();
    },  

    signUp: async (username, password, email, firstName, lastName) => {
        try {
            set({loading: true})

            // gọi API
            await authService.signUp(username, password, email, firstName, lastName);

            toast.success('Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập.')
        } catch (error) {
            console.error(error)
            toast.error('Đăng ký không thành công')
        } finally {
            set({loading: false})
        }
    },

    signIn: async (username, password) => {
        try {
            get().clearState();
            set({loading: true});

            //Phòng khi có lỗi bất ngờ khiến user bị văng ra mà chưa 
            // logout thì lúc đăng nhập lại app vẫn khởi động với state 
            // hoàn toàn mới tránh việc dữ liệu cũ bị xài lại

            localStorage.clear();
            useChatStore.getState().reset();

            const {accessToken} = await authService.signIn(username, password);
            get().setAccessToken(accessToken);

            await get().fetchMe();
            useChatStore.getState().fetchConversations();

            toast.success("Chào mừng bạn quay lại với Moji")
        } catch (error) {
            console.error(error)
            toast.error('Đăng nhập không thành công')
        } finally {
              set({loading: false});
        }
    },

    signOut: async () => {
        try {
            await authService.signOut();
            toast.success("Logout thành công!");
        } catch (error) {
            console.error(error)
            toast.error('Lỗi xảy ra khi logout. Hãy thử lại')
        } finally {
            get().clearState();
        }
    },

    fetchMe: async () => {
        try {
            set({loading: true});
            const user = await authService.fetchMe();

            set({user});


        } catch (error) {
            console.error(error);
            set({user: null, accessToken: null})
            toast.error("Lỗi xảy ra khi lấy dữ liệu người dùng. Hãy thử lại!")
        } finally {
            set ({ loading: false});
        }
    },

    refresh: async () => {
        try {
            set({loading: true})
            const {user, fetchMe, setAccessToken} = get();

            const accessToken = await authService.refresh();

            setAccessToken(accessToken);

            if(!user){
                await fetchMe();
            }
        } catch (error) {
            console.error(error);
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại")
            get().clearState();
        } finally {
           set({loading: false})
        }
    }
}),{
    name: "auth-storage",
    partialize: (state) => ({user: state.user}) //chỉ persitst user
})
)
