
import type { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ProfileCard from "./ProfileCard";
import { useAuthStore } from "@/stores/useAuthStore";
import ProfileSettingsForm from "./ProfileSettingsForm";
import ChangePasswordForm from "./ChangePasswordForm";

interface ProfileDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>
}

const ProfileDialog = ({open, setOpen} : ProfileDialogProps) => {
    const {user} = useAuthStore();
  return (
    <Dialog
    open={open}
    onOpenChange={setOpen}>
        <DialogContent className='max-h-[calc(100vh-2rem)] overflow-y-auto p-0 bg-transparent border-0 shadow-2xl sm:max-w-2xl'>
            <div className="bg-gradient-glass">
                <div className="max-w-4xl mx-auto p-4">
                    {/* heading */}
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold text-foreground">
                            Profile & Settings
                        </DialogTitle>
                    </DialogHeader>

                    <ProfileCard
                        user={user}
                    />

                    <div className="mt-4">
                        <ProfileSettingsForm user={user} />
                    </div>

                    <div className="mt-4">
                        <ChangePasswordForm />
                    </div>
                </div>

            </div>
        </DialogContent>
    </Dialog>
  )
}

export default ProfileDialog
