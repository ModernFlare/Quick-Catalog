import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { products, categories, useCart, type Product } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import BundleCard from "@/components/BundleCard";
import BundleDetailsDialog from "@/components/BundleDetailsDialog";
import { BUNDLES, type Bundle } from "@/lib/bundles";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const BUNDLES_KEY = "Комплекты";
const allFilters = [BUNDLES_KEY, ...categories];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "Все";
  const [search, setSearch] = useState("");
  const [category, setCategoryState] = useState(
    allFilters.includes(initialCategory) ? initialCategory : "Все",
  );
  const [openBundle, setOpenBundle] = useState<Bundle | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const param = searchParams.get("category") ?? "Все";
    if (allFilters.includes(param) && param !== category) {
      setCategoryState(param);
    }
  }, [searchParams]);

  const setCategory = (c: string) => {
    setCategoryState(c);
    if (c === "Все") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", c);
    }
    setSearchParams(searchParams, { replace: true });
  };
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "discount">("default");
  const [priceRange] = useState<[number, number]>([0, 5000]);
  const [onlyDiscount, setOnlyDiscount] = useState(false);

  const showBundles = category === BUNDLES_KEY;

  const filteredBundles = BUNDLES.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.subtitle.toLowerCase().includes(search.toLowerCase()),
  );

  let filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Все" || p.category === category;
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const matchDiscount = !onlyDiscount || p.badge;
    return matchSearch && matchCat && matchPrice && matchDiscount;
  });

  if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === "discount") filtered.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));

  const handleAddBundle = (bundle: Bundle) => {
    const items = bundle.productIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p));
    items.forEach(p => addToCart(p));
    const originalTotal = items.reduce((s, p) => s + p.price, 0);
    const savings = Math.round(originalTotal * (bundle.discountPercent / 100));
    toast({
      title: "✓ Комплект добавлен в корзину",
      description: `${bundle.title} — ${items.length} товаров, экономия ${savings} ₽`,
    });
  };

  return (
    <main className="pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">Каталог товаров</h1>
        <p className="text-muted-foreground mb-8">Найдите свежие продукты по лучшим ценам</p>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={showBundles ? "Поиск комплектов..." : "Поиск товаров..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {!showBundles && (
            <div className="flex gap-2 flex-wrap">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="default">По умолчанию</option>
                <option value="price-asc">Сначала дешёвые</option>
                <option value="price-desc">Сначала дорогие</option>
                <option value="discount">Сначала со скидкой</option>
              </select>
              <Button
                variant={onlyDiscount ? "default" : "outline"}
                size="sm"
                onClick={() => setOnlyDiscount(!onlyDiscount)}
                className="h-10"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Только акции
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setCategory(BUNDLES_KEY)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all border inline-flex items-center gap-1.5",
              category === BUNDLES_KEY
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white border-transparent shadow-md"
                : "bg-gradient-to-r from-orange-50 to-rose-50 text-rose-600 border-rose-200 hover:border-rose-400",
            )}
          >
            <Package className="h-4 w-4" />
            Комплекты
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                category === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {showBundles ? (
          filteredBundles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBundles.map(b => (
                <BundleCard
                  key={b.id}
                  bundle={b}
                  onOpen={() => setOpenBundle(b)}
                  onAdd={handleAddBundle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">📦</p>
              <h3 className="text-lg font-semibold text-foreground mb-2">Комплекты не найдены</h3>
            </div>
          )
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ничего не найдено</h3>
            <p className="text-muted-foreground text-sm">Попробуйте изменить запрос или сбросить фильтры</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setCategory("Все"); setOnlyDiscount(false); }}>
              Сбросить фильтры
            </Button>
          </div>
        )}

        <BundleDetailsDialog
          bundle={openBundle}
          open={!!openBundle}
          onOpenChange={(o) => !o && setOpenBundle(null)}
          onAdd={handleAddBundle}
        />
      </div>
    </main>
  );
};

export default Catalog;
