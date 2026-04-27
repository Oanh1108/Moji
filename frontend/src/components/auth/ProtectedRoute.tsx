import { useAuthStore } from '@/stores/useAuthStore'
import { useChatStore } from '@/stores/useChatStore';
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router';

const ProtectedRoute = () => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const loading = useAuthStore((state) => state.loading);
    const [starting, setStarting] = useState(true);

    useEffect(()=>{
        let mounted = true;

        const init = async () => {
            try {
                const auth = useAuthStore.getState();

                // Có thể xảy ra khi refresh trang
                if(!auth.accessToken){
                    await auth.refresh();
                }

                const latestAuth = useAuthStore.getState();

                if(latestAuth.accessToken && !latestAuth.user) {
                    await latestAuth.fetchMe();
                }

                if(latestAuth.accessToken) {
                    await useChatStore.getState().fetchConversations();
                }
            } finally {
                if(mounted){
                    setStarting(false);
                }
            }
        }

        init();

        return () => {
            mounted = false;
        }
    },[])

    if(starting || loading) {
        return <div className='flex h-screen items-center justify-center'>
            Đang tải trang...
        </div>
    }

    if(!accessToken){
        return (
            <Navigate
                to="/signin"
                replace
            />
        )
    }

  return (
    <Outlet>

    </Outlet>
  )
}

export default ProtectedRoute
