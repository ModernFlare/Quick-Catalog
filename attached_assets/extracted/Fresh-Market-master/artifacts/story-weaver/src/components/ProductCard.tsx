import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, useCart } from "@/lib/store";
import { cn } from "@/lib/utils";
import ReactionButtons from "@/components/ReactionButtons";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
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
    <div className={cn(
      "product-card group rounded-2xl border bg-card p-4 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden",
      qty > 0 ? "border-primary/50" : "border-border"
    )}>
      {product.badge && (
        <span className="promo-badge animate-pulse-badge absolute top-3 right-3 z-10">
          {product.badge}
        </span>
      )}

      {qty > 0 && (
        <span className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
          <ShoppingCart className="h-3 w-3" />
          В корзине
        </span>
      )}

      <div className="flex items-center justify-center h-32 text-7xl mb-4 rounded-xl bg-muted/50 group-hover:scale-105 transition-transform duration-300">
        {product.image}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <h3 className="font-semibold text-foreground text-sm leading-tight">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>

        <ReactionButtons productId={product.id} />

        <div className="flex items-center justify-between pt-3 mt-2 border-t border-border">
          <div>
            <span className="text-lg font-bold text-foreground">{product.price} ₽</span>
            {product.oldPrice && (
              <span className="ml-2 text-sm text-muted-foreground line-through">{product.oldPrice} ₽</span>
            )}
            {product.promoThreshold && (
              <p className="text-xs text-primary font-medium mt-0.5">
                от {product.promoThreshold} шт. — скидка {product.promoDiscount}%
              </p>
            )}
          </div>

          {qty === 0 ? (
            <Button
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => addToCart(product)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-1 bg-primary/10 rounded-full px-1 py-0.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full hover:bg-primary/20 text-primary"
                onClick={handleDecrease}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-6 text-center text-sm font-bold text-primary">
                {qty}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full hover:bg-primary/20 text-primary"
                onClick={handleIncrease}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
