// src/utils/localStore.ts
export const TOKEN_KEY = "velora_token";
export const USER_KEY = "velora_user";
export const CART_KEY = "velora_cart";
export const WISH_KEY = "velora_wish";

export const setToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setUser = (user: Record<string, any> | null) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};

export const getUser = (): Record<string, any> | null => {
  const v = localStorage.getItem(USER_KEY);
  return v ? JSON.parse(v) : null;
};

export const getCart = (): Array<{ id: string; qty: number }> => {
  const v = localStorage.getItem(CART_KEY);
  return v ? JSON.parse(v) : [];
};
export const setCart = (items: Array<{ id: string; qty: number }>) =>
  localStorage.setItem(CART_KEY, JSON.stringify(items));

export const getWish = (): string[] => {
  const v = localStorage.getItem(WISH_KEY);
  return v ? JSON.parse(v) : [];
};
export const setWish = (items: string[]) =>
  localStorage.setItem(WISH_KEY, JSON.stringify(items));
