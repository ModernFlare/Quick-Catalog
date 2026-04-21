import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package, Clock, CheckCircle, Truck, ChefHat,
  XCircle, ArrowLeft, MapPin, RefreshCw, AlertTriangle, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { products } from "@/lib/store";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string | null;
  created_at: string;
  items: OrderItem[];
}

const STEPS = [
  { key: "pending",    short: "Принят",      long: "Ожидает подтверждения",  desc: "Заказ получен, ожидаем подтверждения",       icon: <Clock    className="h-4 w-4" /> },
  { key: "confirmed",  short: "Подтверждён", long: "Подтверждён",             desc: "Заказ подтверждён и передан на сборку",       icon: <CheckCircle className="h-4 w-4" /> },
  { key: "preparing",  short: "Собирается",  long: "Собирается",              desc: "Комплектуем ваш заказ на складе",             icon: <ChefHat  className="h-4 w-4" /> },
  { key: "delivering", short: "В пути",      long: "В пути к вам",            desc: "Курьер уже едет к вам",                       icon: <Truck    className="h-4 w-4" /> },
  { key: "delivered",  short: "Доставлен",   long: "Доставлен",               desc: "Заказ успешно получен. Приятного аппетита!",  icon: <CheckCircle className="h-4 w-4" /> },
];

const BADGE: Record<string, string> = {
  pending:    "bg-muted text-muted-foreground border border-border",
  confirmed:  "bg-primary/10 text-primary border border-primary/20",
  preparing:  "bg-amber-50 text-amber-600 border border-amber-200",
  delivering: "bg-blue-50 text-blue-600 border border-blue-200",
  delivered:  "bg-green-50 text-green-700 border border-green-200",
  cancelled:  "bg-red-50 text-red-600 border border-red-200",
};

const CANCELLABLE = ["pending", "confirmed"];

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [liveId, setLiveId]     = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const loadOrders = async (uid: string) => {
    setError(null);
    const { data: ordersData, error: ordErr } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (ordErr) { setError(ordErr.message); setLoading(false); return; }
    if (!ordersData || ordersData.length === 0) { setOrders([]); setLoading(false); return; }

    const { data: itemsData } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", ordersData.map(o => o.id));

    setOrders(ordersData.map(o => ({
      ...o,
      total_amount: Number(o.total_amount),
      items: (itemsData || [])
        .filter(i => i.order_id === o.id)
        .map(i => ({ ...i, price: Number(i.price) })),
    })));
    setLoading(false);
  };

  const cancelOrder = async (orderId: string) => {
    setCancelling(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .eq("user_id", user!.id);

    if (error) {
      toast.error("Не удалось отменить заказ: " + error.message);
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
      toast.success("Заказ отменён");
    }
    setCancelling(null);
  };

  useEffect(() => {
    if (!user) return;
    loadOrders(user.id);

    const channel = supabase
      .channel("orders-user-" + user.id)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "orders",
        filter: `user_id=eq.${user.id}`,
      }, payload => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, status: payload.new.status } : o));
        setLiveId(payload.new.id);
        setTimeout(() => setLiveId(null), 3000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (!user) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-slide-up">
          <Package className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold mb-3">Войдите в аккаунт</h1>
          <p className="text-muted-foreground mb-6">Чтобы видеть свои заказы, войдите в аккаунт</p>
          <Button asChild><Link to="/auth">Войти</Link></Button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Загружаем заказы...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Ошибка загрузки</h1>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          <Button onClick={() => { setLoading(true); loadOrders(user.id); }}>Попробовать снова</Button>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-slide-up">
          <Package className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold mb-3">Заказов пока нет</h1>
          <p className="text-muted-foreground mb-6">Оформите первый заказ в каталоге</p>
          <Button asChild><Link to="/catalog"><ArrowLeft className="h-4 w-4 mr-2" />Перейти в каталог</Link></Button>
        </div>
      </main>
    );
  }

  const activeCount   = orders.filter(o => !["delivered","cancelled"].includes(o.status)).length;
  const deliveredCount = orders.filter(o => o.status === "delivered").length;

  return (
    <main className="pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Шапка */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Мои заказы</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Всего: <span className="font-semibold text-foreground">{orders.length}</span>
              {activeCount > 0 && <> · Активных: <span className="font-semibold text-primary">{activeCount}</span></>}
              {deliveredCount > 0 && <> · Доставлено: <span className="font-semibold text-green-600">{deliveredCount}</span></>}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"
            onClick={() => { setLoading(true); loadOrders(user.id); }}>
            <RefreshCw className="h-4 w-4" /> Обновить
          </Button>
        </div>

        <div className="space-y-5">
          {orders.map(order => {
            const isCancelled = order.status === "cancelled";
            const isDelivered = order.status === "delivered";
            const stepIdx     = STEPS.findIndex(s => s.key === order.status);
            const step        = STEPS[stepIdx] ?? STEPS[0];
            const canCancel   = CANCELLABLE.includes(order.status);
            const isLive      = liveId === order.id;

            return (
              <div key={order.id} className={cn(
                "rounded-2xl border bg-card p-5 md:p-6 transition-all duration-500",
                isLive && "border-primary shadow-lg shadow-primary/10 scale-[1.005]",
                !isLive && "border-border",
              )}>

                {/* Шапка карточки */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("ru-RU", {
                        day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">#{order.id.slice(0,8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {isLive && (
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse inline-block" />
                        Статус обновлён
                      </span>
                    )}
                    <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full", BADGE[order.status] ?? BADGE.pending)}>
                      {isCancelled ? <XCircle className="h-3.5 w-3.5" /> : step.icon}
                      {isCancelled ? "Отменён" : step.long}
                    </span>
                  </div>
                </div>

                {/* Трекер прогресса */}
                {!isCancelled && !isDelivered && (
                  <div className="mb-5">
                    <div className="flex items-start">
                      {STEPS.map((s, i) => {
                        const done   = i < stepIdx;
                        const active = i === stepIdx;
                        const last   = i === STEPS.length - 1;
                        return (
                          <div key={s.key} className="flex-1 flex flex-col items-center">
                            <div className="flex items-center w-full">
                              {i > 0 && <div className={cn("h-0.5 flex-1 transition-colors duration-700", done || active ? "bg-primary" : "bg-muted")} />}
                              <div className={cn(
                                "h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500 z-10",
                                done   ? "bg-primary border-primary text-primary-foreground" :
                                active ? "bg-background border-primary text-primary ring-4 ring-primary/20" :
                                         "bg-background border-muted-foreground/25 text-muted-foreground/40",
                              )}>
                                {done
                                  ? <CheckCircle className="h-3.5 w-3.5" />
                                  : <span className="scale-[0.7]">{s.icon}</span>}
                              </div>
                              {!last && <div className={cn("h-0.5 flex-1 transition-colors duration-700", done ? "bg-primary" : "bg-muted")} />}
                            </div>
                            <span className={cn(
                              "text-[9px] sm:text-[10px] mt-1.5 text-center leading-tight px-0.5 font-medium",
                              active ? "text-primary" : done ? "text-muted-foreground" : "text-muted-foreground/40",
                            )}>
                              {s.short}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-3 italic">{step.desc}</p>
                  </div>
                )}

                {isDelivered && (
                  <div className="flex items-center gap-2 mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    <p className="text-sm font-medium text-green-700">{step.desc}</p>
                  </div>
                )}

                {isCancelled && (
                  <div className="flex items-center gap-2 mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5">
                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">Этот заказ был отменён</p>
                  </div>
                )}

                {/* Адрес */}
                {order.delivery_address && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                    <span>{order.delivery_address}</span>
                  </div>
                )}

                {/* Товары */}
                <div className="space-y-2 mb-4">
                  {order.items.map(item => {
                    const prod = products.find(p => p.id === item.product_id);
                    return (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <span className="text-lg w-7 text-center shrink-0">{prod?.image ?? "📦"}</span>
                        <span className="flex-1 text-foreground truncate">{item.product_name}</span>
                        <span className="text-muted-foreground whitespace-nowrap">{item.quantity} × {item.price} ₽</span>
                      </div>
                    );
                  })}
                </div>

                {/* Итого + кнопка отмены */}
                <div className="border-t border-border pt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Итого</span>
                    <span className="text-lg font-bold text-foreground">{order.total_amount} ₽</span>
                  </div>

                  {canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1.5"
                          disabled={cancelling === order.id}
                        >
                          {cancelling === order.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <XCircle className="h-3.5 w-3.5" />}
                          Отменить заказ
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Отменить заказ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Заказ #{order.id.slice(0,8).toUpperCase()} на сумму {order.total_amount} ₽ будет отменён.
                            Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Оставить</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => cancelOrder(order.id)}
                          >
                            Да, отменить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Orders;
