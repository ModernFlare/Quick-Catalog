import { Plus, Minus, ShoppingCart, Star, MapPin, Package, Scale } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Product, useCart } from "@/lib/store";
import { useReactions } from "@/hooks/use-reactions";

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetailsDialog = ({ product, open, onOpenChange }: ProductDetailsDialogProps) => {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const { rating, likes, dislikes } = useReactions(product?.id ?? -1);

  if (!product) return null;

  const cartItem = items.find(i => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  const handleDecrease = () => {
    if (qty <= 1) removeFromCart(product.id);
    else updateQuantity(product.id, qty - 1);
  };
  const handleIncrease = () => {
    if (qty === 0) addToCart(product);
    else updateQuantity(product.id, qty + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {product.category}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="relative flex items-center justify-center bg-gradient-to-br from-muted to-muted/40 rounded-2xl p-8 min-h-[240px]">
            <span className="text-9xl">{product.image}</span>
            {product.badge && (
              <span className="promo-badge absolute top-4 right-4">{product.badge}</span>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-foreground/80">{product.description}</p>

            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
                <span className="text-muted-foreground">/ 5</span>
                <span className="text-xs text-muted-foreground">
                  · {likes} 👍 / {dislikes} 👎
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Scale className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Вес: </span>
                  <span className="font-medium text-foreground">{product.weight}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Страна-производитель: </span>
                  <span className="font-medium text-foreground">{product.origin}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Package className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Состав: </span>
                  <span className="font-medium text-foreground">{product.description}</span>
                </div>
              </div>
            </div>

            {product.promoThreshold && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
                <p className="text-sm text-primary font-medium">
                  Акция: от {product.promoThreshold} шт. — скидка {product.promoDiscount}%
                </p>
              </div>
            )}

            <div className="flex items-end justify-between pt-4 border-t border-border">
              <div>
                <p className="text-3xl font-extrabold text-foreground">{product.price} ₽</p>
                {product.oldPrice && (
                  <p className="text-sm text-muted-foreground line-through">{product.oldPrice} ₽</p>
                )}
              </div>
              {qty === 0 ? (
                <Button size="lg" onClick={() => addToCart(product)}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  В корзину
                </Button>
              ) : (
                <div className="flex items-center gap-2 bg-primary/10 rounded-full p-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full text-primary"
                    onClick={handleDecrease}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-bold text-primary">{qty}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full text-primary"
                    onClick={handleIncrease}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
