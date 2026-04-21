import { useMemo, useState } from "react";
import { ShoppingCart, Sparkles, Flame, Check, Info, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products, useCart, type Product } from "@/lib/store";
import type { Bundle } from "@/lib/bundles";
import { cn } from "@/lib/utils";

interface Props {
  bundle: Bundle;
  onOpen: () => void;
  onAdd: (bundle: Bundle) => void;
  variant?: "vivid" | "plain";
}

function useBundleData(bundle: Bundle) {
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

  return { items, originalTotal, bundlePrice, savings, allInCart, justAdded, setJustAdded };
}

const VividBundleCard = ({ bundle, onOpen, onAdd }: Props) => {
  const { items, originalTotal, bundlePrice, savings, allInCart, justAdded, setJustAdded } =
    useBundleData(bundle);

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
          className={cn(
            "w-full font-bold shadow-lg hover:shadow-xl transition-all",
            justAdded || allInCart
              ? "bg-emerald-500 text-white hover:bg-emerald-500"
              : "bg-white text-foreground hover:bg-white/90",
          )}
        >
          {justAdded ? (
            <><Check className="h-5 w-5 mr-2" />Добавлено!</>
          ) : allInCart ? (
            <><Check className="h-5 w-5 mr-2" />Уже в корзине</>
          ) : (
            <><ShoppingCart className="h-5 w-5 mr-2" />В корзину комплектом</>
          )}
        </Button>
      </div>
    </div>
  );
};

const PlainBundleCard = ({ bundle, onOpen, onAdd }: Props) => {
  const { items, originalTotal, bundlePrice, savings, allInCart, justAdded, setJustAdded } =
    useBundleData(bundle);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(bundle);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div
      onClick={onOpen}
      className={cn(
        "group product-card rounded-2xl border bg-card p-4 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer flex flex-col h-full",
        allInCart ? "border-primary/50" : "border-border",
      )}
    >
      <span className="promo-badge absolute top-3 right-3 z-10">
        −{bundle.discountPercent}%
      </span>

      {allInCart && (
        <span className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
          <ShoppingCart className="h-3 w-3" />
          В корзине
        </span>
      )}

      <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/80 text-background text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
        <Info className="h-3 w-3" />
        подробнее
      </div>

      <div className="flex items-center justify-center gap-2 h-32 mb-4 rounded-xl bg-muted/50 p-2 group-hover:scale-[1.02] transition-transform duration-300">
        {items.slice(0, 5).map(p => (
          <span key={p.id} className="text-3xl" title={p.name}>{p.image}</span>
        ))}
      </div>

      <div className="space-y-1 flex-1">
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <Package className="h-3 w-3" />
          Комплект · {items.length} товаров
        </p>
        <h3 className="font-semibold text-foreground text-sm leading-tight">{bundle.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{bundle.subtitle}</p>

        <ul className="mt-2 space-y-0.5">
          {items.slice(0, 3).map(p => (
            <li key={p.id} className="text-xs text-foreground/70 flex items-center gap-1.5">
              <Check className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="truncate">{p.name}</span>
            </li>
          ))}
          {items.length > 3 && (
            <li className="text-xs text-muted-foreground pl-4">+ ещё {items.length - 3}</li>
          )}
        </ul>
      </div>

      <div className="flex items-end justify-between pt-3 mt-3 border-t border-border">
        <div>
          <span className="text-lg font-bold text-foreground">{bundlePrice} ₽</span>
          <span className="ml-2 text-sm text-muted-foreground line-through">{originalTotal} ₽</span>
          <p className="text-xs text-primary font-medium mt-0.5">Экономия {savings} ₽</p>
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          variant={justAdded || allInCart ? "secondary" : "default"}
          className="h-9"
        >
          {justAdded ? (
            <><Check className="h-4 w-4 mr-1" />Добавлено</>
          ) : allInCart ? (
            <><Check className="h-4 w-4 mr-1" />В корзине</>
          ) : (
            <><ShoppingCart className="h-4 w-4 mr-1" />В корзину</>
          )}
        </Button>
      </div>
    </div>
  );
};

const BundleCard = ({ variant = "vivid", ...rest }: Props) =>
  variant === "plain" ? <PlainBundleCard {...rest} /> : <VividBundleCard {...rest} />;

export default BundleCard;
