// Types and a few small lookup arrays. All seed restaurants/dishes have been removed —
// the app pulls real data from the Django backend now.

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tags?: string[];
  category: string;
  popular?: boolean;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  distance: string;
  priceLevel: 1 | 2 | 3;
  tags: string[];
  featured?: boolean;
  menu: Dish[];
};

// Cuisine pills are pure UI metadata — kept for the browse filter.
export const cuisines = [
  { name: "Burgers", emoji: "🍔" },
  { name: "Pizza", emoji: "🍕" },
  { name: "Sushi", emoji: "🍣" },
  { name: "Healthy", emoji: "🥗" },
  { name: "Mexican", emoji: "🌮" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Asian", emoji: "🍜" },
  { name: "Breakfast", emoji: "🥐" },
  { name: "Coffee", emoji: "☕" },
  { name: "Vegan", emoji: "🌱" },
];

// No more static restaurants or dishes — fetched from API.
export const restaurants: Restaurant[] = [];
export const popularDishes: Dish[] = [];
export const findRestaurant = (_slug: string): Restaurant | undefined => undefined;
