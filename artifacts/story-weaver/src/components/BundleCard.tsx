import { useMemo, useState } from "react";
import { ShoppingCart, Sparkles, Flame, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products, useCart, type Product } from "@/lib/store";
import type { Bundle } from "@/lib/bundles";

interface Props {
  bundle: Bundle;
  onOpen: () => void;
  onAdd: (bundle: Bundle) => void;
}

const BundleCard = ({ bundle, onOpen, onAdd }: Props) => {
  const { items: cartItems } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const items = useMemo<Product[]>(
    () =>
      bundle.productIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [bundle.productIds],
  );

  const originalTotal = items.reduce((sum, p) => sum + p.price, 0);
  const bundlePrice = Math.round(originalTotal * (1 - bundle.discountPercent / 100));
  const savings = originalTotal - bundlePrice;
  const allInCart = items.length > 0 && items.every(p => cartItems.some(ci => ci.product.id === p.id));

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(bundle);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div
      onClick={onOpen}
      className="group relative h-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bundle.gradient}`} />
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

      <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-foreground text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
        <Info className="h-3 w-3" />
        подробнее о составе
      </div>

      <div className="relative p-6 flex flex-col h-full text-white">
        <div className="flex items-start justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 bg-white/95 text-foreground text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            {bundle.badge}
          </span>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-white/80 font-semibold">скидка</span>
            <span className="text-4xl font-black leading-none drop-shadow-lg">−{bundle.discountPercent}%</span>
          </div>
        </div>

        <h3 className="text-2xl font-black mb-1 drop-shadow-md leading-tight">{bundle.title}</h3>
        <p className="text-sm text-white/90 mb-5">{bundle.subtitle}</p>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-inner">
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {items.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-muted to-muted/40 text-3xl shadow-sm transition-transform group-hover:scale-110"
                title={p.name}
              >
                {p.image}
              </div>
            ))}
          </div>
          <ul className="space-y-1 border-t border-border pt-3">
            {items.map(p => (
              <li key={p.id} className="text-xs text-foreground/80 flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-muted-foreground">{p.price} ₽</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-end justify-between mb-4 mt-auto">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/75 font-semibold">По отдельности</p>
            <p className="text-base text-white/85 line-through font-medium">{originalTotal} ₽</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-white/85 font-bold flex items-center gap-1 justify-end">
              <Sparkles className="h-3 w-3" />
              экономия {savings} ₽
            </p>
            <p className="text-4xl font-black drop-shadow-lg leading-none mt-1">
              {bundlePrice} <span className="text-2xl">₽</span>
            </p>
          </div>
        </div>

        <Button
          onClick={handleAdd}
          size="lg"
          className={`w-full font-bold shadow-lg hover:shadow-xl transition-all ${
            justAdded || allInCart
              ? "bg-emerald-500 text-white hover:bg-emerald-500"
              : "bg-white text-foreground hover:bg-white/90"
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              Добавлено!
            </>
          ) : allInCart ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              Уже в корзине
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              В корзину комплектом
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BundleCard;
