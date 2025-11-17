// src/utils/localStore.ts
export const TOKEN_KEY = "velora_token";
export const USER_KEY = "velora_user";
export const CART_KEY = "velora_cart";
export const WISH_KEY = "velora_wish";

/**
 * Token helpers
 */
export const setToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * User helpers
 */
export type StoredUser = Record<string, any> | null;

export const setUser = (user: StoredUser) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};

export const getUser = (): StoredUser => {
  const v = localStorage.getItem(USER_KEY);
  return v ? JSON.parse(v) : null;
};

/**
 * Cart helpers
 */
export const getCart = (): Array<{ id: string; qty: number; price?: number; image?: string; name?: string }> => {
  const v = localStorage.getItem(CART_KEY);
  return v ? JSON.parse(v) : [];
};
export const setCart = (items: Array<{ id: string; qty: number }>) =>
  localStorage.setItem(CART_KEY, JSON.stringify(items));
export const clearCart = () => localStorage.removeItem(CART_KEY);

/**
 * Wish helpers
 */
export const getWish = (): any[] => {
  const v = localStorage.getItem(WISH_KEY);
  return v ? JSON.parse(v) : [];
};
export const setWish = (items: any[]) =>
  localStorage.setItem(WISH_KEY, JSON.stringify(items));
export const clearWish = () => localStorage.removeItem(WISH_KEY);

/**
 * Clear all auth (token + user) helper
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
