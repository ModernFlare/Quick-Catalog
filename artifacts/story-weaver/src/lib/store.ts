// Global store for cart state with DB sync
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  description: string;
  origin: string;
  weight: string;
  rating: number;
  promoThreshold?: number;
  promoDiscount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const products: Product[] = [
  // ── Молочные ──
  { id: 1,  name: "Йогурт Греческий",     category: "Молочные",        price: 89,  oldPrice: 119, image: "🥛", badge: "-25%",        description: "Натуральный греческий йогурт без добавок",              origin: "Россия",      weight: "200 г",   rating: 4.8, promoThreshold: 3, promoDiscount: 20 },
  { id: 4,  name: "Сыр Маасдам",          category: "Молочные",        price: 320, oldPrice: 399, image: "🧀", badge: "2 по цене 1", description: "Полутвёрдый сыр с ореховым вкусом",                    origin: "Нидерланды",  weight: "300 г",   rating: 4.7, promoThreshold: 2, promoDiscount: 50 },
  { id: 7,  name: "Молоко 3.2%",          category: "Молочные",        price: 95,  oldPrice: 110, image: "🥛", badge: "-15%",        description: "Пастеризованное молоко 3.2% жирности",                  origin: "Россия",      weight: "1 л",     rating: 4.8 },
  { id: 11, name: "Масло сливочное",      category: "Молочные",        price: 189,                image: "🧈",                       description: "Сливочное масло 82.5% жирности",                        origin: "Россия",      weight: "180 г",   rating: 4.9 },
  { id: 15, name: "Яйца С1",              category: "Молочные",        price: 109,                image: "🥚",                       description: "Куриные яйца категории С1, 10 штук",                    origin: "Россия",      weight: "10 шт",   rating: 4.5 },
  { id: 20, name: "Творог 5%",            category: "Молочные",        price: 75,                 image: "🥣",                       description: "Натуральный творог 5% жирности",                        origin: "Россия",      weight: "200 г",   rating: 4.7, promoThreshold: 4, promoDiscount: 25 },
  { id: 29, name: "Кефир 2.5%",           category: "Молочные",        price: 69,                 image: "🥛",                       description: "Кефир классический 2.5% жирности",                      origin: "Россия",      weight: "1 л",     rating: 4.6 },
  { id: 30, name: "Сметана 20%",          category: "Молочные",        price: 85,  oldPrice: 99,  image: "🥛", badge: "-14%",        description: "Сметана 20% жирности, натуральная",                    origin: "Россия",      weight: "250 г",   rating: 4.7 },
  { id: 31, name: "Ряженка",              category: "Молочные",        price: 72,                 image: "🥛",                       description: "Ряженка топлёная 4% жирности",                          origin: "Россия",      weight: "500 г",   rating: 4.5 },

  // ── Овощи и фрукты ──
  { id: 2,  name: "Авокадо Хасс",         category: "Овощи и фрукты",  price: 149,                image: "🥑",                       description: "Спелый авокадо сорта Хасс, готов к употреблению",       origin: "Мексика",     weight: "180 г",   rating: 4.5 },
  { id: 5,  name: "Бананы",               category: "Овощи и фрукты",  price: 79,                 image: "🍌",                       description: "Свежие бананы высшей категории",                        origin: "Эквадор",     weight: "1 кг",    rating: 4.6 },
  { id: 8,  name: "Помидоры Черри",       category: "Овощи и фрукты",  price: 199,                image: "🍅",                       description: "Сладкие помидоры черри на ветке",                       origin: "Россия",      weight: "250 г",   rating: 4.3, promoThreshold: 3, promoDiscount: 15 },
  { id: 13, name: "Яблоки Гала",          category: "Овощи и фрукты",  price: 119,                image: "🍎",                       description: "Сочные яблоки сорта Гала, сладкие и хрустящие",         origin: "Россия",      weight: "1 кг",    rating: 4.7 },
  { id: 17, name: "Огурцы свежие",        category: "Овощи и фрукты",  price: 89,                 image: "🥒",                       description: "Свежие огурцы длинноплодные",                           origin: "Россия",      weight: "500 г",   rating: 4.3 },
  { id: 21, name: "Морковь",              category: "Овощи и фрукты",  price: 49,                 image: "🥕",                       description: "Свежая морковь мытая",                                  origin: "Россия",      weight: "1 кг",    rating: 4.5 },
  { id: 24, name: "Перец болгарский",     category: "Овощи и фрукты",  price: 159,                image: "🌶️",                      description: "Сладкий болгарский перец ассорти, разные цвета",        origin: "Турция",      weight: "500 г",   rating: 4.4 },
  { id: 32, name: "Лук репчатый",         category: "Овощи и фрукты",  price: 39,                 image: "🧅",                       description: "Лук репчатый золотистый, крупный",                     origin: "Россия",      weight: "1 кг",    rating: 4.4 },
  { id: 33, name: "Капуста белокочанная", category: "Овощи и фрукты",  price: 45,                 image: "🥬",                       description: "Свежая белокочанная капуста, плотный кочан",            origin: "Россия",      weight: "1 кг",    rating: 4.3 },
  { id: 34, name: "Апельсины",            category: "Овощи и фрукты",  price: 129, oldPrice: 149, image: "🍊", badge: "-13%",        description: "Сочные апельсины сорта Навелина",                       origin: "Испания",     weight: "1 кг",    rating: 4.6 },
  { id: 35, name: "Клубника",             category: "Овощи и фрукты",  price: 249, oldPrice: 299, image: "🍓", badge: "-17%",        description: "Свежая клубника садовая крупная",                       origin: "Россия",      weight: "500 г",   rating: 4.8 },

  // ── Хлеб ──
  { id: 3,  name: "Хлеб Бородинский",     category: "Хлеб",            price: 65,                 image: "🍞",                       description: "Классический бородинский хлеб на заварке",              origin: "Россия",      weight: "400 г",   rating: 4.9 },
  { id: 25, name: "Багет французский",    category: "Хлеб",            price: 89,  oldPrice: 109, image: "🥖", badge: "-18%",        description: "Хрустящий французский багет из пшеничной муки",         origin: "Россия",      weight: "250 г",   rating: 4.7 },
  { id: 36, name: "Батон нарезной",       category: "Хлеб",            price: 55,                 image: "🍞",                       description: "Мягкий нарезной батон из пшеничной муки высшего сорта", origin: "Россия",      weight: "400 г",   rating: 4.5 },
  { id: 37, name: "Лаваш армянский",      category: "Хлеб",            price: 49,                 image: "🥙",                       description: "Тонкий армянский лаваш, 5 листов в упаковке",           origin: "Россия",      weight: "250 г",   rating: 4.6 },
  { id: 38, name: "Хлеб цельнозерновой", category: "Хлеб",            price: 79,                 image: "🍞",                       description: "Цельнозерновой хлеб с семенами льна и подсолнуха",      origin: "Россия",      weight: "300 г",   rating: 4.7 },

  // ── Мясо ──
  { id: 6,  name: "Филе куриное",         category: "Мясо",            price: 289,                image: "🍗",                       description: "Охлаждённое куриное филе без кости",                    origin: "Россия",      weight: "500 г",   rating: 4.4 },
  { id: 18, name: "Говядина вырезка",     category: "Мясо",            price: 599, oldPrice: 699, image: "🥩", badge: "-15%",        description: "Охлаждённая говяжья вырезка высшего сорта",             origin: "Россия",      weight: "400 г",   rating: 4.6 },
  { id: 28, name: "Свинина шейка",        category: "Мясо",            price: 389,                image: "🥓",                       description: "Свиная шейка для гриля и запекания",                    origin: "Россия",      weight: "500 г",   rating: 4.5 },
  { id: 39, name: "Фарш говяжий",         category: "Мясо",            price: 349, oldPrice: 399, image: "🥩", badge: "-12%",        description: "Фарш говяжий охлаждённый, высший сорт",                 origin: "Россия",      weight: "500 г",   rating: 4.5 },
  { id: 40, name: "Куриные бёдра",        category: "Мясо",            price: 219,                image: "🍗",                       description: "Куриные бёдра охлаждённые без хребта",                  origin: "Россия",      weight: "1 кг",    rating: 4.4 },
  { id: 41, name: "Колбаса докторская",   category: "Мясо",            price: 279,                image: "🌭",                       description: "Докторская варёная колбаса по ГОСТ",                    origin: "Россия",      weight: "300 г",   rating: 4.3 },

  // ── Рыба ──
  { id: 14, name: "Лосось филе",          category: "Рыба",            price: 689, oldPrice: 799, image: "🐟", badge: "-14%",        description: "Свежее филе атлантического лосося",                     origin: "Норвегия",    weight: "300 г",   rating: 4.8 },
  { id: 23, name: "Креветки",             category: "Рыба",            price: 459,                image: "🦐",                       description: "Королевские креветки очищенные, замороженные",           origin: "Вьетнам",     weight: "300 г",   rating: 4.6, promoThreshold: 2, promoDiscount: 20 },
  { id: 42, name: "Тунец консервированный", category: "Рыба",          price: 189,                image: "🐟",                       description: "Тунец в собственном соку, натуральный",                 origin: "Таиланд",     weight: "185 г",   rating: 4.5 },
  { id: 43, name: "Сельдь пряного посола", category: "Рыба",           price: 249, oldPrice: 289, image: "🐠", badge: "-14%",        description: "Сельдь атлантическая пряного посола, филе",             origin: "Норвегия",    weight: "300 г",   rating: 4.4 },
  { id: 44, name: "Минтай филе",          category: "Рыба",            price: 299,                image: "🐟",                       description: "Филе минтая замороженное без кожи и костей",            origin: "Россия",      weight: "400 г",   rating: 4.3 },

  // ── Бакалея ──
  { id: 9,  name: "Макароны Барилла",     category: "Бакалея",         price: 159,                image: "🍝",                       description: "Спагетти из твёрдых сортов пшеницы",                   origin: "Италия",      weight: "500 г",   rating: 4.7 },
  { id: 12, name: "Рис Басмати",          category: "Бакалея",         price: 199,                image: "🍚",                       description: "Ароматный рис басмати длиннозёрный",                    origin: "Индия",       weight: "900 г",   rating: 4.6 },
  { id: 22, name: "Шоколад тёмный",       category: "Бакалея",         price: 129,                image: "🍫",                       description: "Тёмный шоколад 72% какао",                              origin: "Швейцария",   weight: "100 г",   rating: 4.8 },
  { id: 27, name: "Мёд цветочный",        category: "Бакалея",         price: 289,                image: "🍯",                       description: "Натуральный цветочный мёд",                             origin: "Россия",      weight: "350 г",   rating: 4.9 },
  { id: 45, name: "Гречка",               category: "Бакалея",         price: 89,  oldPrice: 109, image: "🌾", badge: "-18%",        description: "Гречневая крупа ядрица, высший сорт",                   origin: "Россия",      weight: "900 г",   rating: 4.8 },
  { id: 46, name: "Масло оливковое",      category: "Бакалея",         price: 459,                image: "🌿",                       description: "Оливковое масло Extra Virgin первого холодного отжима", origin: "Испания",     weight: "500 мл",  rating: 4.9 },
  { id: 47, name: "Геркулес",             category: "Бакалея",         price: 79,                 image: "🌾",                       description: "Овсяные хлопья быстрого приготовления",                 origin: "Россия",      weight: "500 г",   rating: 4.6 },

  // ── Напитки ──
  { id: 10, name: "Сок Апельсиновый",     category: "Напитки",         price: 129, oldPrice: 159, image: "🧃", badge: "-20%",        description: "100% натуральный апельсиновый сок прямого отжима",      origin: "Россия",      weight: "1 л",     rating: 4.5 },
  { id: 16, name: "Кофе молотый",         category: "Напитки",         price: 349,                image: "☕",                       description: "Арабика 100%, средняя обжарка",                         origin: "Бразилия",    weight: "250 г",   rating: 4.9 },
  { id: 19, name: "Чай зелёный",          category: "Напитки",         price: 179,                image: "🍵",                       description: "Листовой зелёный чай с жасмином",                       origin: "Китай",       weight: "100 г",   rating: 4.4 },
  { id: 26, name: "Вода минеральная",     category: "Напитки",         price: 59,                 image: "💧",                       description: "Природная минеральная вода негазированная",             origin: "Россия",      weight: "1.5 л",   rating: 4.3 },
  { id: 48, name: "Газировка Тархун",     category: "Напитки",         price: 89,  oldPrice: 99,  image: "🥤", badge: "-10%",        description: "Лимонад Тархун на натуральном экстракте эстрагона",     origin: "Россия",      weight: "1.5 л",   rating: 4.5 },
  { id: 49, name: "Кисель клюквенный",    category: "Напитки",         price: 55,                 image: "🍹",                       description: "Кисель из концентрированного клюквенного сока",         origin: "Россия",      weight: "500 мл",  rating: 4.2 },
  { id: 50, name: "Какао",                category: "Напитки",         price: 189,                image: "🍫",                       description: "Какао-порошок алкализованный 10-12% жирности",          origin: "Нидерланды",  weight: "200 г",   rating: 4.7 },
];

export const categories = ["Все", "Молочные", "Овощи и фрукты", "Хлеб", "Мясо", "Рыба", "Бакалея", "Напитки"];

// Simple event-based cart with DB sync
let cartItems: CartItem[] = [];
let listeners: (() => void)[] = [];
let currentUserId: string | null = null;
let syncing = false;

function notify() {
  listeners.forEach(l => l());
}

async function syncToDb() {
  if (!currentUserId || syncing) return;
  syncing = true;
  try {
    await supabase.from('cart_items').delete().eq('user_id', currentUserId);
    if (cartItems.length > 0) {
      await supabase.from('cart_items').insert(
        cartItems.map(i => ({
          user_id: currentUserId!,
          product_id: i.product.id,
          quantity: i.quantity,
        }))
      );
    }
  } catch (e) {
    console.error('Cart sync error:', e);
  }
  syncing = false;
}

async function loadFromDb(userId: string) {
  const { data } = await supabase
    .from('cart_items')
    .select('product_id, quantity')
    .eq('user_id', userId);
  if (data && data.length > 0) {
    cartItems = data
      .map(row => {
        const product = products.find(p => p.id === row.product_id);
        if (!product) return null;
        return { product, quantity: row.quantity } as CartItem;
      })
      .filter(Boolean) as CartItem[];
    notify();
  }
}

export function setCartUser(userId: string | null) {
  if (userId === currentUserId) return;
  currentUserId = userId;
  if (userId) {
    loadFromDb(userId);
  } else {
    cartItems = [];
    notify();
  }
}

export function useCart() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  const addToCart = useCallback((product: Product) => {
    const existing = cartItems.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cartItems.push({ product, quantity: 1 });
    }
    notify();
    syncToDb();
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    cartItems = cartItems.filter(i => i.product.id !== productId);
    notify();
    syncToDb();
  }, []);

  const updateQuantity = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      cartItems = cartItems.filter(i => i.product.id !== productId);
    } else {
      const item = cartItems.find(i => i.product.id === productId);
      if (item) item.quantity = qty;
    }
    notify();
    syncToDb();
  }, []);

  const clearCart = useCallback(() => {
    cartItems = [];
    notify();
    syncToDb();
  }, []);

  const getTotal = useCallback(() =>
    cartItems.reduce((sum, item) => {
      const hasPromo = item.product.promoThreshold && item.quantity >= item.product.promoThreshold;
      const discount = hasPromo ? item.product.promoDiscount! / 100 : 0;
      return sum + item.product.price * item.quantity * (1 - discount);
    }, 0), []);

  const getOriginalTotal = useCallback(() =>
    cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0), []);

  const getTotalItems = () => cartItems.reduce((s, i) => s + i.quantity, 0);

  return { items: [...cartItems], addToCart, removeFromCart, updateQuantity, clearCart, getTotal, getOriginalTotal, getTotalItems };
}
