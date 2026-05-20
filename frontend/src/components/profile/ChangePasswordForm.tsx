import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Save } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ChangePasswordForm = () => {
  const { changePassword } = useUserStore();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasValue =
    !!form.currentPassword || !!form.newPassword || !!form.confirmPassword;

  const canSubmit =
    form.currentPassword.length > 0 &&
    form.newPassword.length >= 6 &&
    form.confirmPassword.length >= 6 &&
    !saving;

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) return;

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    try {
      setSaving(true);
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(initialForm);
    } finally {
      setSaving(false);
    }
  };

  const passwordType = showPassword ? "text" : "password";

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="size-4" />
          Đổi mật khẩu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
              <Input
                id="current-password"
                type={passwordType}
                value={form.currentPassword}
                onChange={(e) => updateField("currentPassword", e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <Input
                id="new-password"
                type={passwordType}
                value={form.newPassword}
                onChange={(e) => updateField("newPassword", e.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <Input
                id="confirm-password"
                type={passwordType}
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showPassword ? "Ẩn" : "Hiện"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(initialForm)}
              disabled={!hasValue || saving}
            >
              Xóa
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              <Save className="size-4" />
              {saving ? "Đang lưu" : "Lưu mật khẩu"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;
