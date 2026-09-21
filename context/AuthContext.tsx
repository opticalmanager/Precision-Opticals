"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Order, UserProfile, PrescriptionData, ShippingAddress } from "@/types";

interface AuthContextType {
  user: UserProfile;
  isLoggedIn: boolean;
  isGuest: boolean;
  setGuestCheckout: (val: boolean) => void;
  loginWithPhone: (phone: string, name?: string) => void;
  loginWithEmail: (email: string, name?: string) => void;
  logout: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  saveShippingAddress: (address: ShippingAddress) => void;
  orders: Order[];
  gemPoints: number;
  addPoints: (amount: number) => void;
  redeemPoints: (amount: number) => boolean;
  saveOrder: (order: Order) => void;
  savePrescription: (title: string, data: PrescriptionData, doctorName?: string) => void;
  selectedTrackingOrder: Order | null;
  isTrackingModalOpen: boolean;
  openTrackingModal: (order?: Order) => void;
  closeTrackingModal: () => void;
}

const ORDERS_STORAGE_KEY = "precision_optics_orders_v2";
const USER_STORAGE_KEY = "precision_optics_user_v2";
const AUTH_STATUS_KEY = "precision_optics_auth_status_v2";

const INITIAL_USER: UserProfile = {
  id: "usr-precision-01",
  name: "Alexander Sterling",
  email: "a.sterling@precisionoptics.com",
  phone: "+91 98100 12345",
  gemPoints: 850,
  savedAddresses: [
    {
      fullName: "Alexander Sterling",
      phone: "+91 98100 12345",
      email: "a.sterling@precisionoptics.com",
      streetAddress: "Villa 42, Magnolias Boulevard, Golf Course Road",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122002",
      country: "India",
    },
  ],
  savedPrescriptions: [
    {
      id: "rx-01",
      title: "Current Progressive Vision",
      date: "2026-01-15",
      doctorName: "Dr. R. K. Malhotra (Precision Optometry)",
      data: {
        rightEye: { sph: "-1.50", cyl: "-0.75", axis: "90", add: "+1.50" },
        leftEye: { sph: "-1.75", cyl: "-0.50", axis: "85", add: "+1.50" },
        pd: "64",
      },
    },
  ],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedAuth = localStorage.getItem(AUTH_STATUS_KEY);
      if (savedAuth !== null) {
        setIsLoggedIn(savedAuth === "true");
      }

      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.warn("Failed to load user auth data:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn("Failed to save user data:", e);
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(AUTH_STATUS_KEY, isLoggedIn ? "true" : "false");
    } catch (e) {
      console.warn("Failed to save auth status:", e);
    }
  }, [isLoggedIn, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn("Failed to save orders:", e);
    }
  }, [orders, isLoaded]);

  const loginWithPhone = useCallback((phone: string, name?: string) => {
    setUser((prev) => ({
      ...prev,
      phone: phone.startsWith("+91") ? phone : `+91 ${phone}`,
      name: name || prev.name || "Precision Member",
    }));
    setIsLoggedIn(true);
    setIsGuest(false);
  }, []);

  const loginWithEmail = useCallback((email: string, name?: string) => {
    setUser((prev) => ({
      ...prev,
      email,
      name: name || prev.name || "Precision Member",
    }));
    setIsLoggedIn(true);
    setIsGuest(false);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setIsGuest(false);
  }, []);

  const setGuestCheckout = useCallback((val: boolean) => {
    setIsGuest(val);
  }, []);

  const updateUserProfile = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
  }, []);

  const saveShippingAddress = useCallback((address: ShippingAddress) => {
    setUser((prev) => {
      // Avoid duplicate exact addresses
      const filtered = prev.savedAddresses.filter(
        (a) =>
          a.streetAddress.toLowerCase() !== address.streetAddress.toLowerCase() ||
          a.pincode !== address.pincode
      );
      return {
        ...prev,
        savedAddresses: [address, ...filtered],
      };
    });
  }, []);

  const addPoints = useCallback((amount: number) => {
    setUser((prev) => ({ ...prev, gemPoints: prev.gemPoints + amount }));
  }, []);

  const redeemPoints = useCallback(
    (amount: number): boolean => {
      if (user.gemPoints >= amount) {
        setUser((prev) => ({ ...prev, gemPoints: prev.gemPoints - amount }));
        return true;
      }
      return false;
    },
    [user.gemPoints]
  );

  const saveOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
    const earnedPoints = Math.round(order.totalAmount / 100);
    setUser((prev) => ({ ...prev, gemPoints: prev.gemPoints + earnedPoints }));
  }, []);

  const savePrescription = useCallback(
    (title: string, data: PrescriptionData, doctorName?: string) => {
      setUser((prev) => ({
        ...prev,
        savedPrescriptions: [
          ...prev.savedPrescriptions,
          {
            id: `rx-${Date.now()}`,
            title,
            date: new Date().toISOString().split("T")[0],
            doctorName: doctorName || "Precision Optics Certified Optometrist",
            data,
          },
        ],
      }));
    },
    []
  );

  const openTrackingModal = useCallback(
    (order?: Order) => {
      if (order) {
        setSelectedTrackingOrder(order);
      } else if (orders.length > 0) {
        setSelectedTrackingOrder(orders[0]);
      }
      setIsTrackingModalOpen(true);
    },
    [orders]
  );

  const closeTrackingModal = useCallback(() => {
    setIsTrackingModalOpen(false);
    setSelectedTrackingOrder(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isGuest,
        setGuestCheckout,
        loginWithPhone,
        loginWithEmail,
        logout,
        updateUserProfile,
        saveShippingAddress,
        orders,
        gemPoints: user.gemPoints,
        addPoints,
        redeemPoints,
        saveOrder,
        savePrescription,
        selectedTrackingOrder,
        isTrackingModalOpen,
        openTrackingModal,
        closeTrackingModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
