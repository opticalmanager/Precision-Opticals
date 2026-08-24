import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, UserProfile, PrescriptionData } from '../types';

interface AuthContextType {
  user: UserProfile;
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

const ORDERS_STORAGE_KEY = 'precision_optics_orders_v1';
const USER_STORAGE_KEY = 'precision_optics_user_v1';

const INITIAL_USER: UserProfile = {
  id: 'usr-precision-01',
  name: 'Alexander Sterling',
  email: 'a.sterling@precisionoptics.com',
  phone: '+91 98100 12345',
  gemPoints: 850,
  savedAddresses: [
    {
      fullName: 'Alexander Sterling',
      phone: '+91 98100 12345',
      email: 'a.sterling@precisionoptics.com',
      streetAddress: 'Villa 42, Magnolias Boulevard, Golf Course Road',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      country: 'India'
    }
  ],
  savedPrescriptions: [
    {
      id: 'rx-01',
      title: 'Current Progressive Vision',
      date: '2026-01-15',
      doctorName: 'Dr. R. K. Malhotra (Precision Optometry)',
      data: {
        rightEye: { sph: '-1.50', cyl: '-0.75', axis: '90', add: '+1.50' },
        leftEye: { sph: '-1.75', cyl: '-0.50', axis: '85', add: '+1.50' },
        pd: '64'
      }
    }
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (err) {
      console.warn('Failed to save user profile:', err);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (err) {
      console.warn('Failed to save orders history:', err);
    }
  }, [orders]);

  const addPoints = useCallback((amount: number) => {
    setUser((prev) => ({ ...prev, gemPoints: prev.gemPoints + amount }));
  }, []);

  const redeemPoints = useCallback((amount: number): boolean => {
    if (user.gemPoints >= amount) {
      setUser((prev) => ({ ...prev, gemPoints: prev.gemPoints - amount }));
      return true;
    }
    return false;
  }, [user.gemPoints]);

  const saveOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
    // Reward 10% in points
    const earnedPoints = Math.round(order.totalAmount / 100);
    setUser((prev) => ({ ...prev, gemPoints: prev.gemPoints + earnedPoints }));
  }, []);

  const savePrescription = useCallback((title: string, data: PrescriptionData, doctorName?: string) => {
    setUser((prev) => ({
      ...prev,
      savedPrescriptions: [
        ...prev.savedPrescriptions,
        {
          id: `rx-${Date.now()}`,
          title,
          date: new Date().toISOString().split('T')[0],
          doctorName: doctorName || 'Precision Optics Certified Optometrist',
          data
        }
      ]
    }));
  }, []);

  const openTrackingModal = useCallback((order?: Order) => {
    if (order) {
      setSelectedTrackingOrder(order);
    } else if (orders.length > 0) {
      setSelectedTrackingOrder(orders[0]);
    }
    setIsTrackingModalOpen(true);
  }, [orders]);

  const closeTrackingModal = useCallback(() => {
    setIsTrackingModalOpen(false);
    setSelectedTrackingOrder(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        orders,
        gemPoints: user.gemPoints,
        addPoints,
        redeemPoints,
        saveOrder,
        savePrescription,
        selectedTrackingOrder,
        isTrackingModalOpen,
        openTrackingModal,
        closeTrackingModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
