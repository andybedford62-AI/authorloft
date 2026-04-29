"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  saleItemId:    string;
  bookId:        string;
  bookSlug:      string;
  bookTitle:     string;
  coverImageUrl: string | null;
  format:        string;
  label:         string;
  priceCents:    number;
}

interface CartContextValue {
  items:       CartItem[];
  addItem:     (item: CartItem) => void;
  removeItem:  (saleItemId: string) => void;
  clearCart:   () => void;
  isInCart:    (saleItemId: string) => boolean;
  itemCount:   number;
  totalCents:  number;
  isOpen:      boolean;
  openCart:    () => void;
  closeCart:   () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "authorloft_cart";

// ── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items,  setItems]  = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage quota errors
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.saleItemId === item.saleItemId)) return prev;
      return [...prev, item];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((saleItemId: string) => {
    setItems((prev) => prev.filter((i) => i.saleItemId !== saleItemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (saleItemId: string) => items.some((i) => i.saleItemId === saleItemId),
    [items]
  );

  const openCart  = useCallback(() => setIsOpen(true),  []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const itemCount  = items.length;
  const totalCents = items.reduce((sum, i) => sum + i.priceCents, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        isInCart,
        itemCount,
        totalCents,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
