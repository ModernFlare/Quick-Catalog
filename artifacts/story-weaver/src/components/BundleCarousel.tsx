import { useMemo, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ShoppingCart, Sparkles, Flame, Check } from "lucide-react";
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
  gradient: string;
  accent: string;
}

const BUNDLES: Bundle[] = [
  {
    id: "breakfast",
    title: "Сытный завтрак",
    subtitle: "Чаще всего заказывают по утрам",
    badge: "Хит заказов",
    productIds: [7, 11, 15, 47],
    discountPercent: 15,
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    accent: "bg-amber-500",
  },
  {
    id: "family-dinner",
    title: "Семейный ужин",
    subtitle: "Полный набор для ужина на 4 персоны",
    badge: "−20%",
    productIds: [6, 21, 32, 33, 3],
    discountPercent: 20,
    gradient: "from-emerald-500 via-green-600 to-teal-600",
    accent: "bg-emerald-500",
  },
  {
    id: "pasta-night",
    title: "Итальянский вечер",
    subtitle: "Паста, сыр и оливковое масло",
    badge: "Топ выбор",
    productIds: [9, 4, 46, 8],
    discountPercent: 18,
    gradient: "from-red-500 via-rose-600 to-pink-600",
    accent: "bg-rose-500",
  },
  {
    id: "fish-set",
    title: "Рыбный набор",
    subtitle: "Лосось, креветки и чай",
    badge: "−25%",
    productIds: [14, 23, 19],
    discountPercent: 25,
    gradient: "from-sky-500 via-blue-600 to-indigo-600",
    accent: "bg-sky-500",
  },
  {
    id: "fruits-box",
    title: "Витаминный бокс",
    subtitle: "Фрукты и ягоды на всю неделю",
    badge: "Популярное",
    productIds: [2, 5, 13, 34, 35],
    discountPercent: 17,
    gradient: "from-fuchsia-500 via-purple-600 to-violet-600",
    accent: "bg-fuchsia-500",
  },
  {
    id: "tea-time",
    title: "Полдник",
    subtitle: "Чай, шоколад и мёд",
    badge: "−15%",
    productIds: [19, 22, 27, 25],
    discountPercent: 15,
    gradient: "from-yellow-400 via-amber-500 to-orange-600",
    accent: "bg-yellow-500",
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
    <div className="group relative h-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      {/* Цветной градиентный фон */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bundle.gradient}`} />

      {/* Декоративные круги */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

      <div className="relative p-6 flex flex-col h-full text-white">
        {/* Верхняя часть с бейджем и скидкой */}
        <div className="flex items-start justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 bg-white/95 text-foreground text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            {bundle.badge}
          </span>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-white/80 font-semibold">
              скидка
            </span>
            <span className="text-4xl font-black leading-none drop-shadow-lg">
              −{bundle.discountPercent}%
            </span>
          </div>
        </div>

        {/* Заголовок */}
        <h3 className="text-2xl font-black mb-1 drop-shadow-md leading-tight">{bundle.title}</h3>
        <p className="text-sm text-white/90 mb-5">{bundle.subtitle}</p>

        {/* Иконки товаров на белом фоне */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-inner">
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {items.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-muted to-muted/40 text-3xl shadow-sm transition-transform group-hover:scale-110"
                style={{ transitionDelay: `${items.indexOf(p) * 40}ms` }}
                title={p.name}
              >
                {p.image}
              </div>
            ))}
          </div>
          <ul className="space-y-1 border-t border-border pt-3">
            {items.map(p => (
              <li
                key={p.id}
                className="text-xs text-foreground/80 flex items-center gap-2"
              >
                <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-muted-foreground">{p.price} ₽</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Цена */}
        <div className="flex items-end justify-between mb-4 mt-auto">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/75 font-semibold">
              По отдельности
            </p>
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

        {/* Кнопка */}
        <Button
          onClick={handleAdd}
          size="lg"
          className="w-full bg-white text-foreground hover:bg-white/90 font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          В корзину комплектом
        </Button>
      </div>
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
      <CarouselPrevious className="hidden md:flex -left-4 h-12 w-12 bg-white shadow-xl border-0 hover:bg-primary hover:text-white transition-all" />
      <CarouselNext className="hidden md:flex -right-4 h-12 w-12 bg-white shadow-xl border-0 hover:bg-primary hover:text-white transition-all" />
    </Carousel>
  );
};

export default BundleCarousel;
