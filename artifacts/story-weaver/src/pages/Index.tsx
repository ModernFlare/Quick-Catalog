import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, Clock, Flame, Package } from "lucide-react";
import { products } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import BundleCarousel from "@/components/BundleCarousel";

const Index = () => {
  const bestDeals = [...products]
    .map(p => {
      const priceDiscount = p.oldPrice ? (p.oldPrice - p.price) / p.oldPrice : 0;
      const promoDiscount = p.promoDiscount ? p.promoDiscount / 100 : 0;
      const score = Math.max(priceDiscount, promoDiscount);
      return { product: p, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(x => x.product);

  return (
    <main className="pt-16">
      <section className="py-12 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <span className="promo-badge inline-block mb-3">Хиты заказов</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Выгодные комплекты
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Готовые наборы продуктов, которые чаще всего заказывают. По отдельности — дороже, комплектом — выгоднее.
            </p>
          </div>
          <BundleCarousel />
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground flex items-center gap-3">
                <Flame className="h-8 w-8 text-secondary" />
                Максимальная выгода
              </h2>
              <p className="text-muted-foreground mt-2">
                Товары с лучшими скидками — добавляйте в корзину прямо отсюда
              </p>
            </div>
            <Link
              to="/catalog"
              className="text-primary font-medium text-sm hover:underline flex items-center gap-1"
            >
              Весь каталог <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestDeals.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Truck className="h-8 w-8 text-primary" />, title: "Быстрая доставка", desc: "Доставим заказ в течение 60 минут в удобное для вас время" },
              { icon: <Shield className="h-8 w-8 text-primary" />, title: "Гарантия свежести", desc: "Контроль качества на каждом этапе — от склада до вашей двери" },
              { icon: <Clock className="h-8 w-8 text-primary" />, title: "Удобный заказ", desc: "Оформите заказ за 2 минуты с автоматическим применением скидок" },
            ].map((item, i) => (
              <div
                key={i}
                className="animate-fade-slide-up rounded-2xl bg-card p-8 text-center shadow-sm border border-border"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-4 bg-card">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-foreground mb-3">ФрешМаркет</h4>
            <p className="text-sm text-muted-foreground">Сервис доставки свежих продуктов с лучшими акциями и скидками.</p>
          </div>
          <div>
            <h5 className="font-bold text-foreground mb-3">Навигация</h5>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Главная</Link></li>
              <li><Link to="/catalog" className="text-muted-foreground hover:text-primary transition-colors">Каталог</Link></li>
              <li><Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">Корзина</Link></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-foreground mb-3">Контакты</h6>
            <p className="text-sm text-muted-foreground">
              Телефон: <a href="tel:+78001234567" className="text-primary hover:underline">8 (800) 123-45-67</a>
              <br />
              Email: <a href="mailto:info@freshmarket.ru" className="text-primary hover:underline">info@freshmarket.ru</a>
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border text-center">
          <span className="text-xs text-muted-foreground">© 2025 ФрешМаркет. Все права защищены.</span>
        </div>
      </footer>
    </main>
  );
};

export default Index;
