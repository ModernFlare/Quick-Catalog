import { useMemo, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ShoppingCart, TrendingUp, Check } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { products, useCart, type Product } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

interface Bundle {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  productIds: number[];
  discountPercent: number;
}

const BUNDLES: Bundle[] = [
  {
    id: "breakfast",
    title: "Сытный завтрак",
    subtitle: "Чаще всего заказывают по утрам",
    badge: "Хит заказов",
    productIds: [7, 11, 15, 47],
    discountPercent: 15,
  },
  {
    id: "family-dinner",
    title: "Семейный ужин",
    subtitle: "Полный набор для ужина на 4 персоны",
    badge: "−20% к сумме",
    productIds: [6, 21, 32, 33, 3],
    discountPercent: 20,
  },
  {
    id: "pasta-night",
    title: "Итальянский вечер",
    subtitle: "Паста, сыр и оливковое масло",
    badge: "Топ выбор",
    productIds: [9, 4, 46, 8],
    discountPercent: 18,
  },
  {
    id: "fish-set",
    title: "Рыбный набор",
    subtitle: "Лосось, креветки и лимон в одном комплекте",
    badge: "−25% к сумме",
    productIds: [14, 23, 19],
    discountPercent: 25,
  },
  {
    id: "fruits-box",
    title: "Витаминный бокс",
    subtitle: "Фрукты и ягоды на всю неделю",
    badge: "Популярное",
    productIds: [2, 5, 13, 34, 35],
    discountPercent: 17,
  },
  {
    id: "tea-time",
    title: "Полдник",
    subtitle: "Чай, шоколад и мёд по выгодной цене",
    badge: "−15% к сумме",
    productIds: [19, 22, 27, 25],
    discountPercent: 15,
  },
];

const BundleCard = ({ bundle }: { bundle: Bundle }) => {
  const { addToCart } = useCart();

  const items = useMemo(
    () =>
      bundle.productIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [bundle.productIds],
  );

  const originalTotal = items.reduce((sum, p) => sum + p.price, 0);
  const bundlePrice = Math.round(originalTotal * (1 - bundle.discountPercent / 100));
  const savings = originalTotal - bundlePrice;

  const handleAdd = () => {
    items.forEach(p => addToCart(p));
    toast({
      title: "Комплект добавлен в корзину",
      description: `${bundle.title} — экономия ${savings} ₽`,
    });
  };

  return (
    <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-all flex flex-col">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <span className="promo-badge inline-block mb-2">{bundle.badge}</span>
          <h3 className="text-lg font-bold text-foreground leading-tight">{bundle.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{bundle.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {items.map(p => (
          <div
            key={p.id}
            className="flex items-center justify-center h-14 w-14 rounded-xl bg-muted/60 text-3xl"
            title={p.name}
          >
            {p.image}
          </div>
        ))}
      </div>

      <ul className="space-y-1 mb-4 flex-1">
        {items.map(p => (
          <li key={p.id} className="text-xs text-muted-foreground flex items-start gap-2">
            <Check className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
            <span className="flex-1">{p.name}</span>
            <span className="text-foreground/70">{p.price} ₽</span>
          </li>
        ))}
      </ul>

      <div className="flex items-end justify-between pt-4 border-t border-border mb-4">
        <div>
          <p className="text-xs text-muted-foreground">По отдельности</p>
          <p className="text-sm text-muted-foreground line-through">{originalTotal} ₽</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-primary font-medium flex items-center gap-1 justify-end">
            <TrendingUp className="h-3.5 w-3.5" />
            экономия {savings} ₽
          </p>
          <p className="text-2xl font-bold text-foreground">{bundlePrice} ₽</p>
        </div>
      </div>

      <Button onClick={handleAdd} className="w-full" size="lg">
        <ShoppingCart className="h-4 w-4 mr-2" />
        В корзину комплектом
      </Button>
    </div>
  );
};

const BundleCarousel = () => {
  const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  return (
    <Carousel
      opts={{ align: "start", loop: true, duration: 40 }}
      plugins={[autoplay.current]}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {BUNDLES.map(bundle => (
          <CarouselItem key={bundle.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
            <BundleCard bundle={bundle} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-4" />
      <CarouselNext className="hidden md:flex -right-4" />
    </Carousel>
  );
};

export default BundleCarousel;
