import { useState, useEffect } from "react";
import { User, Lock, MapPin, Save, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import AddressInput from "@/components/AddressInput";

const Profile = () => {
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [lastName, setLastName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, last_name, delivery_address")
        .eq("user_id", user.id)
        .maybeSingle();

      const savedLastName: string = (data as any)?.last_name ?? "";
      const rawFullName: string = data?.full_name ?? user.user_metadata?.full_name ?? "";
      const deliveryAddr: string = (data as any)?.delivery_address ?? "";

      // Если фамилия ещё не сохранена отдельно, но в full_name есть пробел —
      // разделяем: первое слово → имя, остальное → фамилия
      if (!savedLastName && rawFullName.includes(" ")) {
        const parts = rawFullName.trim().split(/\s+/);
        setFullName(parts[0]);
        setLastName(parts.slice(1).join(" "));
      } else {
        setFullName(rawFullName);
        setLastName(savedLastName);
      }

      setDeliveryAddress(deliveryAddr);
      setProfileLoading(false);
    };
    load();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    const combinedName = [fullName.trim(), lastName.trim()].filter(Boolean).join(" ");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: combinedName, last_name: lastName.trim(), delivery_address: deliveryAddress.trim() } as any)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Ошибка сохранения: " + error.message);
    } else {
      toast.success("Профиль сохранён!");
    }
    setProfileSaving(false);
  };

  const savePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Заполните все поля");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error("Ошибка смены пароля: " + error.message);
    } else {
      toast.success("Пароль успешно изменён!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  };

  if (!user) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Войдите в аккаунт, чтобы просмотреть профиль</p>
          <Button asChild><Link to="/auth">Войти</Link></Button>
        </div>
      </main>
    );
  }

  if (profileLoading) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Мой профиль</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Tabs defaultValue="info">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="info" className="flex-1 gap-1.5">
              <User className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Личные данные</span>
              <span className="sm:hidden text-xs">Данные</span>
            </TabsTrigger>
            <TabsTrigger value="address" className="flex-1 gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Адрес доставки</span>
              <span className="sm:hidden text-xs">Адрес</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex-1 gap-1.5">
              <Lock className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Смена пароля</span>
              <span className="sm:hidden text-xs">Пароль</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Личные данные ── */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Личные данные</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email ?? ""} readOnly className="bg-muted/50 cursor-default" />
                  <p className="text-xs text-muted-foreground">Email нельзя изменить</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="full-name">Имя</Label>
                    <Input
                      id="full-name"
                      placeholder="Иван"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="last-name">Фамилия</Label>
                    <Input
                      id="last-name"
                      placeholder="Иванов"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                </div>
                <Button onClick={saveProfile} disabled={profileSaving} className="w-full gap-2">
                  {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Сохранить
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Адрес доставки ── */}
          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Адрес доставки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="delivery-address">Адрес</Label>
                  <AddressInput
                    id="delivery-address"
                    placeholder="ул. Пушкина, д. 10, кв. 5"
                    value={deliveryAddress}
                    onChange={setDeliveryAddress}
                  />
                  <p className="text-xs text-muted-foreground">
                    Адрес будет автоматически подставлен при оформлении заказа
                  </p>
                </div>
                <Button onClick={saveProfile} disabled={profileSaving} className="w-full gap-2">
                  {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Сохранить адрес
                </Button>
                {deliveryAddress && (
                  <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">{deliveryAddress}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Пароль ── */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Смена пароля</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm-password">Повторите пароль</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Повторите новый пароль"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button onClick={savePassword} disabled={passwordSaving} className="w-full gap-2">
                  {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Изменить пароль
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Profile;
