"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface WishlistContextType {
  wishlistIds: string[];
  wishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WISHLIST_STORAGE_KEY = "precision_optics_wishlist_v2";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        setWishlistIds(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load wishlist:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch (e) {
      console.warn("Failed to save wishlist:", e);
    }
  }, [wishlistIds, isLoaded]);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback((productId: string, productName?: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        toast.info("Removed from Saved Frames", {
          description: productName ? `${productName} removed.` : undefined,
        });
        return prev.filter((id) => id !== productId);
      } else {
        toast.success("Saved to Wishlist", {
          description: productName ? `${productName} added to your personal vault.` : undefined,
        });
        return [...prev, productId];
      }
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    toast.info("Frame removed from saved list.");
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlistIds([]);
    toast.info("All saved frames cleared.");
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
