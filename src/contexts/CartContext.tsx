import React, { createContext, useContext, useState } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, color: string, size: string) => void;
  updateQuantity: (id: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (i) => i.id === item.id && i.color === item.color && i.size === item.size
      );
      
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id && i.color === item.color && i.size === item.size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string, color: string, size: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.color === color && item.size === size))
    );
  };

  const updateQuantity = (id: string, color: string, size: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.color === color && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
