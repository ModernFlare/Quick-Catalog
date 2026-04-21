import { useMemo } from "react";
import { ShoppingCart, Sparkles, Check, MapPin, Scale } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { products, useCart, type Product } from "@/lib/store";
import type { Bundle } from "@/lib/bundles";

interface BundleDetailsDialogProps {
  bundle: Bundle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (bundle: Bundle) => void;
}

const BundleDetailsDialog = ({ bundle, open, onOpenChange, onAdd }: BundleDetailsDialogProps) => {
  const items = useMemo<Product[]>(
    () =>
      bundle
        ? bundle.productIds
            .map(id => products.find(p => p.id === id))
            .filter((p): p is Product => Boolean(p))
        : [],
    [bundle],
  );

  const { items: cartItems } = useCart();

  if (!bundle) return null;

  const originalTotal = items.reduce((sum, p) => sum + p.price, 0);
  const bundlePrice = Math.round(originalTotal * (1 - bundle.discountPercent / 100));
  const savings = originalTotal - bundlePrice;

  const inCart = items.every(p => cartItems.some(ci => ci.product.id === p.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className={`relative bg-gradient-to-br ${bundle.gradient} text-white p-6`}>
          <span className="inline-block bg-white/95 text-foreground text-xs font-bold uppercase px-3 py-1.5 rounded-full mb-3">
            {bundle.badge}
          </span>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-white">{bundle.title}</DialogTitle>
            <DialogDescription className="text-white/90 text-base">
              {bundle.subtitle}
            </DialogDescription>
          </DialogHeader>
          <div className="absolute top-4 right-12 text-right">
            <span className="text-[10px] uppercase tracking-widest text-white/80 font-semibold">
              скидка
            </span>
            <p className="text-4xl font-black leading-none">−{bundle.discountPercent}%</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-foreground/80">{bundle.description}</p>

          <div>
            <h4 className="font-bold text-foreground mb-3">Состав комплекта</h4>
            <div className="space-y-2">
              {items.map(p => (
                <div
                  key={p.id}
                  className="flex items-start gap-3 rounded-xl border border-border p-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-muted text-2xl flex-shrink-0">
                    {p.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Scale className="h-3 w-3" /> {p.weight}
                      </span>
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {p.origin}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground text-sm whitespace-nowrap">
                    {p.price} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between pt-4 border-t border-border">
            <div>
              <p className="text-xs uppercase text-muted-foreground font-semibold">По отдельности</p>
              <p className="text-base text-muted-foreground line-through">{originalTotal} ₽</p>
              <p className="text-xs text-primary font-medium flex items-center gap-1 mt-1">
                <Sparkles className="h-3 w-3" />
                Экономия {savings} ₽
              </p>
            </div>
            <p className="text-4xl font-black text-foreground">{bundlePrice} ₽</p>
          </div>

          <Button
            onClick={() => onAdd(bundle)}
            size="lg"
            className="w-full font-bold"
            variant={inCart ? "secondary" : "default"}
          >
            {inCart ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Добавлено в корзину
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Добавить комплект в корзину
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BundleDetailsDialog;
