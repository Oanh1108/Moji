import { useEffect, useMemo, useState, type FormEvent } from "react";
import { RotateCcw, Save } from "lucide-react";
import type { User } from "@/types/user";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface ProfileSettingsFormProps {
  user: User | null;
}

const getInitialForm = (user: User | null) => ({
  displayName: user?.displayName ?? "",
  bio: user?.bio ?? "",
  phone: user?.phone ?? "",
});

const ProfileSettingsForm = ({ user }: ProfileSettingsFormProps) => {
  const { updateProfile } = useUserStore();
  const [form, setForm] = useState(getInitialForm(user));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(getInitialForm(user));
  }, [user]);

  const initialForm = useMemo(() => getInitialForm(user), [user]);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const bioLength = form.bio.length;

  if (!user) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.displayName.trim() || saving) return;

    try {
      setSaving(true);
      await updateProfile({
        displayName: form.displayName,
        bio: form.bio,
        phone: form.phone,
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-username">Username</Label>
              <Input
                id="profile-username"
                value={user.username}
                disabled
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                value={user.email}
                disabled
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-display-name">Tên hiển thị</Label>
              <Input
                id="profile-display-name"
                value={form.displayName}
                maxLength={80}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    displayName: e.target.value,
                  }))
                }
                placeholder="Tên hiển thị"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone">Số điện thoại</Label>
              <Input
                id="profile-phone"
                value={form.phone}
                maxLength={30}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    phone: e.target.value,
                  }))
                }
                placeholder="Thêm số điện thoại"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="profile-bio">Bio</Label>
              <span className="text-xs text-muted-foreground">{bioLength}/500</span>
            </div>
            <Textarea
              id="profile-bio"
              value={form.bio}
              maxLength={500}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  bio: e.target.value,
                }))
              }
              placeholder="Viết vài dòng về bạn"
              className="min-h-24 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={!isDirty || saving}
            >
              <RotateCcw className="size-4" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || !form.displayName.trim() || saving}
            >
              <Save className="size-4" />
              {saving ? "Đang lưu" : "Lưu"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSettingsForm;
