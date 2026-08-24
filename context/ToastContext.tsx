"use client";

import React, { createContext, useContext, useCallback } from "react";
import { toast } from "sonner";

interface ToastContextType {
  addToast: (title: string, message?: string, type?: "success" | "error" | "info" | "warning") => void;
  toasts: any[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const addToast = useCallback(
    (title: string, message?: string, type: "success" | "error" | "info" | "warning" = "info") => {
      if (type === "success") {
        toast.success(title, { description: message });
      } else if (type === "error") {
        toast.error(title, { description: message });
      } else if (type === "warning") {
        toast.warning(title, { description: message });
      } else {
        toast.info(title, { description: message });
      }
    },
    []
  );

  return (
    <ToastContext.Provider value={{ addToast, toasts: [], removeToast: () => {} }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: (title: string, message?: string, type: "success" | "error" | "info" | "warning" = "info") => {
        if (type === "success") toast.success(title, { description: message });
        else if (type === "error") toast.error(title, { description: message });
        else toast.info(title, { description: message });
      },
      toasts: [],
      removeToast: () => {},
    };
  }
  return context;
};
