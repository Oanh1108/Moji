import { useAuthStore } from '@/stores/useAuthStore'
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { DropdownMenuItem } from '../ui/dropdown-menu';

const Logout = () => {

    const {signOut} = useAuthStore();
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/signin");
        } catch (error) {
            console.error(error);
        }
    }

  return (
    <DropdownMenuItem
        className="cursor-pointer"
        variant="destructive"
        onClick={handleLogout}
    >
        <LogOut className='text-destructive'/>
        Log out
    </DropdownMenuItem>
  )
}

export default Logout
