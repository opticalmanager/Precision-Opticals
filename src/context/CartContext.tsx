import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem, Product, ProductVariant, SelectedLensConfig } from '../types';
import { useToast } from './ToastContext';

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

const CART_STORAGE_KEY = 'precision_optics_cart_v1';
const CLEANING_KIT_PRICE = 100;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [includeCleaningKit, setIncludeCleaningKit] = useState<boolean>(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to save cart to localStorage:', err);
    }
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCartDirect = useCallback(
    (product: Product, variant?: ProductVariant) => {
      const variantSuffix = variant ? `-${variant.id}` : '';
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
            selectedVariant: variant
          }
        ];
      });

      addToast('Added to Cart', `${product.name} (Frame Only) added to your shopping bag.`, 'success');
      setIsCartOpen(true);
    },
    [addToast]
  );

  const addCustomLensToCart = useCallback(
    (product: Product, config: SelectedLensConfig, variant?: ProductVariant) => {
      const variantSuffix = variant ? `-${variant.id}` : '';
      const newItemId = `${product.id}${variantSuffix}-lens-${Date.now()}`;

      setItems((prev) => [
        ...prev,
        {
          id: newItemId,
          product,
          quantity: 1,
          selectedColor: variant?.colorName,
          selectedVariant: variant,
          lensConfig: config
        }
      ]);

      const lensName = config.lensPackage ? config.lensPackage.name : 'Custom Lenses';
      addToast(
        'Custom Prescription Added',
        `${product.name} with ${lensName} added to your bag.`,
        'success'
      );
      setIsCartOpen(true);
    },
    [addToast]
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

  const removeItem = useCallback(
    (cartItemId: string) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === cartItemId);
        if (item) {
          addToast('Item Removed', `${item.product.name} removed from your bag.`, 'info');
        }
        return prev.filter((i) => i.id !== cartItemId);
      });
    },
    [addToast]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountPercentage(0);
    setIncludeCleaningKit(false);
  }, []);

  const applyCoupon = useCallback(
    (code: string): { success: boolean; message: string } => {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode === 'PO10' || cleanCode === 'GEM10' || cleanCode === 'BOGO') {
        setAppliedCoupon(cleanCode);
        setDiscountPercentage(10);
        addToast('Coupon Applied', `Code "${cleanCode}" saved 10% on your order!`, 'success');
        return { success: true, message: '10% discount applied successfully!' };
      }
      if (cleanCode === 'PRECISION20') {
        setAppliedCoupon(cleanCode);
        setDiscountPercentage(20);
        addToast('VIP Voucher Applied', 'VIP Privilege: 20% discount unlocked!', 'success');
        return { success: true, message: 'VIP 20% discount applied!' };
      }

      addToast('Invalid Coupon', 'Code not recognized. Use "PO10" for 10% off.', 'error');
      return { success: false, message: 'Invalid code. Use "PO10" for 10% off' };
    },
    [addToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountPercentage(0);
  }, []);

  // Cart Calculations
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
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
