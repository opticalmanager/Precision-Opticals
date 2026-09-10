"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { CartItem, Product, ProductVariant, SelectedLensConfig } from "@/types";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addToCartDirect: (product: Product, variant?: ProductVariant) => void;
  addCustomLensToCart: (product: Product, config: SelectedLensConfig, variant?: ProductVariant) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  appliedCoupon: string | null;
  discountPercentage: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  includeCleaningKit: boolean;
  setIncludeCleaningKit: (include: boolean) => void;
  rawSubtotal: number;
  cleaningKitPrice: number;
  discountAmount: number;
  grandTotal: number;
}

const CART_STORAGE_KEY = "precision_optics_cart_v2";
const CLEANING_KIT_PRICE = 100;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [includeCleaningKit, setIncludeCleaningKit] = useState<boolean>(false);

  // Load from localStorage on mount (hydration safe)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load cart from storage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save cart to storage:", e);
    }
  }, [items, isLoaded]);

  const openCart = useCallback(() => {
    setIsCartOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-cart-page"));
    }
  }, []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCartDirect = useCallback((product: Product, variant?: ProductVariant) => {
    const variantSuffix = variant ? `-${variant.id}` : "";
    const newItemId = `${product.id}${variantSuffix}-frame-only`;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === newItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: newItemId,
          product,
          quantity: 1,
          selectedColor: variant?.colorName,
          selectedVariant: variant,
        },
      ];
    });

    toast.success("Added to Shopping Bag", {
      description: `${product.name} (${variant?.colorName || "Standard"}) added.`,
      action: {
        label: "View Cart",
        onClick: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("open-cart-page"));
          }
        },
      },
    });
  }, []);

  const addCustomLensToCart = useCallback(
    (product: Product, config: SelectedLensConfig, variant?: ProductVariant) => {
      const variantSuffix = variant ? `-${variant.id}` : "";
      const newItemId = `${product.id}${variantSuffix}-lens-${Date.now()}`;

      setItems((prev) => [
        ...prev,
        {
          id: newItemId,
          product,
          quantity: 1,
          selectedColor: variant?.colorName,
          selectedVariant: variant,
          lensConfig: config,
        },
      ]);

      const lensTitle = config.lensPackage ? config.lensPackage.name : "Custom Rx Lenses";
      toast.success("Custom Lenses Configured", {
        description: `${product.name} fitted with ${lensTitle}.`,
        action: {
          label: "View Cart",
          onClick: () => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("open-cart-page"));
            }
          },
        },
      });
    },
    []
  );

  const updateQuantity = useCallback((cartItemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === cartItemId);
      if (item) {
        toast.info("Item Removed", {
          description: `${item.product.name} removed from your bag.`,
        });
      }
      return prev.filter((i) => i.id !== cartItemId);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountPercentage(0);
    setIncludeCleaningKit(false);
  }, []);

  const applyCoupon = useCallback((code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === "PO10" || cleanCode === "GEM10" || cleanCode === "BOGO") {
      setAppliedCoupon(cleanCode);
      setDiscountPercentage(10);
      toast.success("Coupon Applied", {
        description: `Promo code "${cleanCode}" saved 10% on your order.`,
      });
      return { success: true, message: "10% discount applied successfully!" };
    }
    if (cleanCode === "PRECISION20") {
      setAppliedCoupon(cleanCode);
      setDiscountPercentage(20);
      toast.success("VIP Voucher Applied", {
        description: "20% VIP Privilege discount unlocked.",
      });
      return { success: true, message: "VIP 20% discount applied!" };
    }

    toast.error("Invalid Promo Code", {
      description: "Code not recognized. Try using 'PO10' for 10% off.",
    });
    return { success: false, message: "Invalid code. Use 'PO10' for 10% off" };
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountPercentage(0);
    toast.info("Coupon Removed");
  }, []);

  // Subtotal & Grand Total Calculations
  const rawSubtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const itemLensPrice = item.lensConfig ? item.lensConfig.totalLensPrice : 0;
      return acc + (item.product.price + itemLensPrice) * item.quantity;
    }, 0);
  }, [items]);

  const cleaningKitPrice = includeCleaningKit ? CLEANING_KIT_PRICE : 0;
  const currentSubtotal = rawSubtotal + cleaningKitPrice;
  const discountAmount = Math.round((currentSubtotal * discountPercentage) / 100);
  const grandTotal = Math.max(0, currentSubtotal - discountAmount);

  const cartCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        addToCartDirect,
        addCustomLensToCart,
        updateQuantity,
        removeItem,
        clearCart,
        appliedCoupon,
        discountPercentage,
        applyCoupon,
        removeCoupon,
        includeCleaningKit,
        setIncludeCleaningKit,
        rawSubtotal,
        cleaningKitPrice,
        discountAmount,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
