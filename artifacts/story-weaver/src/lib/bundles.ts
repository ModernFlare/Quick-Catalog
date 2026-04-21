export interface Bundle {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  productIds: number[];
  discountPercent: number;
  gradient: string;
}

export const BUNDLES: Bundle[] = [
  {
    id: "breakfast",
    title: "Сытный завтрак",
    subtitle: "Чаще всего заказывают по утрам",
    description:
      "Полноценный завтрак на всю семью: молоко, масло, яйца и геркулес. Идеально подходит для быстрых утренних блюд — каши, омлета или бутербродов.",
    badge: "Хит заказов",
    productIds: [7, 11, 15, 47],
    discountPercent: 15,
    gradient: "from-amber-400 via-orange-500 to-rose-500",
  },
  {
    id: "family-dinner",
    title: "Семейный ужин",
    subtitle: "Полный набор для ужина на 4 персоны",
    description:
      "Готовое решение для домашнего ужина: куриное филе, овощи и хлеб. Хватит, чтобы накормить семью из 4 человек без планирования меню.",
    badge: "−20%",
    productIds: [6, 21, 32, 33, 3],
    discountPercent: 20,
    gradient: "from-emerald-500 via-green-600 to-teal-600",
  },
  {
    id: "pasta-night",
    title: "Итальянский вечер",
    subtitle: "Паста, сыр и оливковое масло",
    description:
      "Всё для классической итальянской пасты: спагетти из твёрдых сортов, маасдам, оливковое масло Extra Virgin и помидоры черри.",
    badge: "Топ выбор",
    productIds: [9, 4, 46, 8],
    discountPercent: 18,
    gradient: "from-red-500 via-rose-600 to-pink-600",
  },
  {
    id: "fish-set",
    title: "Рыбный набор",
    subtitle: "Лосось, креветки и чай",
    description:
      "Премиальный набор морепродуктов: свежий норвежский лосось, королевские креветки и зелёный чай с жасмином в подарок к ужину.",
    badge: "−25%",
    productIds: [14, 23, 19],
    discountPercent: 25,
    gradient: "from-sky-500 via-blue-600 to-indigo-600",
  },
  {
    id: "fruits-box",
    title: "Витаминный бокс",
    subtitle: "Фрукты и ягоды на всю неделю",
    description:
      "Бокс свежих фруктов и ягод: авокадо, бананы, яблоки, апельсины и клубника. Заряд витаминов на всю неделю.",
    badge: "Популярное",
    productIds: [2, 5, 13, 34, 35],
    discountPercent: 17,
    gradient: "from-fuchsia-500 via-purple-600 to-violet-600",
  },
  {
    id: "tea-time",
    title: "Полдник",
    subtitle: "Чай, шоколад и мёд",
    description:
      "Уютный набор для чаепития: зелёный чай, тёмный шоколад 72%, цветочный мёд и хрустящий французский багет.",
    badge: "−15%",
    productIds: [19, 22, 27, 25],
    discountPercent: 15,
    gradient: "from-yellow-400 via-amber-500 to-orange-600",
  },
];
