import { useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import BundleCard from "@/components/BundleCard";
import BundleDetailsDialog from "@/components/BundleDetailsDialog";
import { BUNDLES, type Bundle } from "@/lib/bundles";
import { products, useCart } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

const BundleCarousel = () => {
  const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const [openBundle, setOpenBundle] = useState<Bundle | null>(null);
  const { addToCart } = useCart();

  const handleAdd = (bundle: Bundle) => {
    const items = bundle.productIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean) as { id: number; price: number }[] as any[];
    items.forEach(p => addToCart(p));
    const originalTotal = items.reduce((s, p) => s + p.price, 0);
    const savings = Math.round(originalTotal * (bundle.discountPercent / 100));
    toast({
      title: "✓ Комплект добавлен в корзину",
      description: `${bundle.title} — ${items.length} товаров, экономия ${savings} ₽`,
    });
  };

  return (
    <>
      <Carousel
        opts={{ align: "start", loop: true, duration: 40 }}
        plugins={[autoplay.current]}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {BUNDLES.map(bundle => (
            <CarouselItem key={bundle.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <BundleCard
                bundle={bundle}
                onOpen={() => setOpenBundle(bundle)}
                onAdd={handleAdd}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-4 h-12 w-12 bg-white shadow-xl border-0 hover:bg-primary hover:text-white transition-all" />
        <CarouselNext className="hidden md:flex -right-4 h-12 w-12 bg-white shadow-xl border-0 hover:bg-primary hover:text-white transition-all" />
      </Carousel>
      <BundleDetailsDialog
        bundle={openBundle}
        open={!!openBundle}
        onOpenChange={(o) => !o && setOpenBundle(null)}
        onAdd={handleAdd}
      />
    </>
  );
};

export default BundleCarousel;
