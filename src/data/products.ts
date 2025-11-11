import productWhiteTee from "@/assets/product-white-tee.jpg";
import productBlackTee from "@/assets/product-black-tee.jpg";
import productOliveTee from "@/assets/product-olive-tee.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  gender: "women" | "men" | "unisex";
  description: string;
  fabric: string;
  fit: string;
  colors: {
    name: string;
    value: string;
    images: string[];
  }[];
  sizes: string[];
}

export const products: Product[] = [
  {
    id: "essential-crew-tee",
    name: "The Essential Crew Tee",
    price: 48.0,
    category: "Tops",
    gender: "unisex",
    description: "A wardrobe staple crafted from 100% organic cotton. This timeless tee features a classic crew neck and a relaxed fit that works for any occasion.",
    fabric: "100% Organic Cotton",
    fit: "Relaxed fit. Model is 5'10\" and wears size M.",
    colors: [
      {
        name: "White",
        value: "#FFFFFF",
        images: [productWhiteTee, productWhiteTee, productWhiteTee],
      },
      {
        name: "Black",
        value: "#000000",
        images: [productBlackTee, productBlackTee, productBlackTee],
      },
      {
        name: "Olive",
        value: "#6B7F39",
        images: [productOliveTee, productOliveTee, productOliveTee],
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "organic-linen-shirt",
    name: "Organic Linen Shirt",
    price: 98.0,
    category: "Tops",
    gender: "women",
    description: "Breathable and lightweight, this linen shirt is perfect for warm weather. Features a relaxed collar and French seams for durability.",
    fabric: "100% Organic Linen",
    fit: "Regular fit. Model is 5'9\" and wears size S.",
    colors: [
      {
        name: "Natural",
        value: "#F5F1E8",
        images: [productWhiteTee, productWhiteTee, productWhiteTee],
      },
      {
        name: "Sage",
        value: "#9CAF88",
        images: [productOliveTee, productOliveTee, productOliveTee],
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "merino-wool-sweater",
    name: "Merino Wool Sweater",
    price: 128.0,
    category: "Tops",
    gender: "unisex",
    description: "Luxuriously soft merino wool in a timeless crewneck silhouette. Naturally temperature-regulating and odor-resistant.",
    fabric: "100% Merino Wool",
    fit: "Relaxed fit. Model is 6'0\" and wears size M.",
    colors: [
      {
        name: "Charcoal",
        value: "#36454F",
        images: [productBlackTee, productBlackTee, productBlackTee],
      },
      {
        name: "Cream",
        value: "#FFFDD0",
        images: [productWhiteTee, productWhiteTee, productWhiteTee],
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "wide-leg-trouser",
    name: "Wide Leg Trouser",
    price: 138.0,
    category: "Bottoms",
    gender: "women",
    description: "Elegant wide-leg trousers with a high waist and pleated front. Made from Tencel™ for a fluid drape and sustainable comfort.",
    fabric: "100% Tencel™ Lyocell",
    fit: "High-waisted, wide leg. Model is 5'10\" and wears size 28.",
    colors: [
      {
        name: "Black",
        value: "#000000",
        images: [productBlackTee, productBlackTee, productBlackTee],
      },
      {
        name: "Sand",
        value: "#C2B280",
        images: [productWhiteTee, productWhiteTee, productWhiteTee],
      },
    ],
    sizes: ["24", "26", "28", "30", "32", "34"],
  },
  {
    id: "organic-cotton-chino",
    name: "Organic Cotton Chino",
    price: 118.0,
    category: "Bottoms",
    gender: "men",
    description: "Classic chinos reimagined in soft organic cotton with a modern tapered fit. Features side pockets and a button closure.",
    fabric: "98% Organic Cotton, 2% Elastane",
    fit: "Tapered fit. Model is 6'1\" and wears size 32.",
    colors: [
      {
        name: "Khaki",
        value: "#C3B091",
        images: [productWhiteTee, productWhiteTee, productWhiteTee],
      },
      {
        name: "Navy",
        value: "#000080",
        images: [productBlackTee, productBlackTee, productBlackTee],
      },
    ],
    sizes: ["28", "30", "32", "34", "36", "38"],
  },
  {
    id: "recycled-cashmere-cardigan",
    name: "Recycled Cashmere Cardigan",
    price: 198.0,
    category: "Outerwear",
    gender: "unisex",
    description: "Luxurious recycled cashmere in a timeless cardigan silhouette. Features mother-of-pearl buttons and ribbed cuffs.",
    fabric: "95% Recycled Cashmere, 5% Wool",
    fit: "Relaxed fit. Model is 5'9\" and wears size M.",
    colors: [
      {
        name: "Camel",
        value: "#C19A6B",
        images: [productWhiteTee, productWhiteTee, productWhiteTee],
      },
      {
        name: "Forest",
        value: "#228B22",
        images: [productOliveTee, productOliveTee, productOliveTee],
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "linen-blend-dress",
    name: "Linen Blend Dress",
    price: 148.0,
    category: "Dresses",
    gender: "women",
    description: "Effortlessly elegant midi dress with a relaxed silhouette and side pockets. Perfect for warm weather.",
    fabric: "70% Linen, 30% Organic Cotton",
    fit: "Relaxed fit. Model is 5'10\" and wears size S.",
    colors: [
      {
        name: "Oat",
        value: "#E8DCC4",
        images: [productWhiteTee, productWhiteTee, productWhiteTee],
      },
      {
        name: "Terracotta",
        value: "#E2725B",
        images: [productOliveTee, productOliveTee, productOliveTee],
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "hemp-utility-jacket",
    name: "Hemp Utility Jacket",
    price: 218.0,
    category: "Outerwear",
    gender: "unisex",
    description: "Durable hemp-blend jacket with multiple pockets and a relaxed fit. Gets softer with every wear.",
    fabric: "55% Hemp, 45% Organic Cotton",
    fit: "Relaxed fit. Model is 6'0\" and wears size L.",
    colors: [
      {
        name: "Stone",
        value: "#928E85",
        images: [productWhiteTee, productWhiteTee, productWhiteTee],
      },
      {
        name: "Olive",
        value: "#556B2F",
        images: [productOliveTee, productOliveTee, productOliveTee],
      },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
];
