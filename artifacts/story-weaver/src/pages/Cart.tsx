import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Gift, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import AddressInput from "@/components/AddressInput";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, getTotal, getOriginalTotal, getTotalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ordered, setOrdered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const [addressLoaded, setAddressLoaded] = useState(false);
  const total = getTotal();
  const originalTotal = getOriginalTotal();
  const savings = originalTotal - total;

  // Автоподстановка адреса из профиля
  useEffect(() => {
    if (!user || addressLoaded) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("delivery_address")
        .eq("user_id", user.id)
        .maybeSingle();
      const saved = (data as any)?.delivery_address;
      if (saved) setAddress(saved);
      setAddressLoaded(true);
    };
    load();
  }, [user, addressLoaded]);

  const handleOrder = async () => {
    if (!user) {
      toast.error("Войдите в аккаунт, чтобы оформить заказ");
      navigate("/auth");
      return;
    }
    if (!address.trim()) {
      toast.error("Укажите адрес доставки");
      return;
    }
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({ user_id: user.id, total_amount: Math.round(total), delivery_address: address.trim() })
        .select()
        .single();

      if (error || !order) throw error;

      const orderItems = items.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        quantity,
        price: product.price,
      }));

      await supabase.from("order_items").insert(orderItems);
      clearCart();
      setOrdered(true);
      toast.success("Заказ оформлен!");
    } catch (e: any) {
      toast.error("Ошибка оформления: " + (e?.message || "попробуйте позже"));
    }
    setSubmitting(false);
  };

  if (ordered) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-slide-up">
          <CheckCircle className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Заказ оформлен!</h1>
          <p className="text-muted-foreground mb-6">Вы можете отслеживать статус в разделе «Мои заказы».</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild><Link to="/orders">Мои заказы</Link></Button>
            <Button variant="outline" asChild><Link to="/catalog">Продолжить покупки</Link></Button>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-slide-up">
          <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Корзина пуста</h1>
          <p className="text-muted-foreground mb-6">Добавьте товары из каталога, чтобы начать покупки</p>
          <Button asChild><Link to="/catalog"><ArrowLeft className="h-4 w-4 mr-2" />Перейти в каталог</Link></Button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-8">Корзина</h1>

        <div className="space-y-4 mb-8">
          {items.map(({ product, quantity }) => {
            const hasPromo = product.promoThreshold && quantity >= product.promoThreshold;
            const discount = hasPromo ? product.promoDiscount! / 100 : 0;
            const itemTotal = product.price * quantity * (1 - discount);

            return (
              <div key={product.id} className="product-card flex items-center gap-4 rounded-2xl border border-border bg-card p-4 animate-fade-slide-up">
                <div className="text-4xl flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-xl bg-muted">
                  {product.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.price} ₽ / шт.</p>
                  {hasPromo && (
                    <div className="flex items-center gap-1 mt-1">
                      <Gift className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium text-primary">🎁 Оптовая скидка {product.promoDiscount}% применена!</span>
                    </div>
                  )}
                  {product.promoThreshold && !hasPromo && (
                    <p className="text-xs text-muted-foreground mt-1">Ещё {product.promoThreshold - quantity} шт. для скидки {product.promoDiscount}%</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-foreground text-sm">{quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right min-w-[80px]">
                  {discount > 0 && (
                    <p className="text-xs text-muted-foreground line-through">{(product.price * quantity).toFixed(0)} ₽</p>
                  )}
                  <p className={cn("font-bold text-sm", discount > 0 ? "text-primary" : "text-foreground")}>{itemTotal.toFixed(0)} ₽</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Итого */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Товаров: {getTotalItems()} шт.</span>
            <span>{originalTotal.toFixed(0)} ₽</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-sm font-medium text-primary">
              <span>🎁 Ваша экономия</span>
              <span>-{savings.toFixed(0)} ₽</span>
            </div>
          )}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="address">Адрес доставки</Label>
                {user && (
                  <Link to="/profile" className="text-xs text-primary hover:underline">
                    Изменить в профиле
                  </Link>
                )}
              </div>
              <AddressInput
                id="address"
                placeholder="ул. Пушкина, д. 10, кв. 5"
                value={address}
                onChange={setAddress}
              />
              {user && !address && addressLoaded && (
                <p className="text-xs text-muted-foreground">
                  Сохраните адрес в{" "}
                  <Link to="/profile" className="text-primary hover:underline">профиле</Link>
                  {" "}— он будет подставляться автоматически
                </p>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-extrabold text-foreground">Итого</span>
              <span className="text-2xl font-extrabold text-foreground">{total.toFixed(0)} ₽</span>
            </div>
            <Button size="lg" className="w-full mt-2" onClick={handleOrder} disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Оформляем...</> : "Подтвердить заказ"}
            </Button>
            {!user && <p className="text-xs text-muted-foreground text-center">Для оформления необходимо войти в аккаунт</p>}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
