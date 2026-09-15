"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Menu,
  ExternalLink,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminGlobalSearchModal } from "../common/AdminGlobalSearchModal";

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileMenu }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Mock live notification items for optical retail
  const notifications = [
    {
      id: "n-1",
      title: "New Luxury Order",
      desc: "Order PO-914820 (Cartier Première) received for Optician Assembly",
      time: "10m ago",
      unread: true,
      type: "order",
    },
    {
      id: "n-2",
      title: "Low Stock Alert",
      desc: "Ray-Ban Meta Matte Black stock dropped to 4 units",
      time: "1h ago",
      unread: true,
      type: "alert",
    },
    {
      id: "n-3",
      title: "Eye Exam Appointment",
      desc: "Dr. R. K. Malhotra confirmed boutique session at Noida Arcade",
      time: "3h ago",
      unread: false,
      type: "appointment",
    },
  ];

  return (
    <>
      <header className="h-14 bg-[#FAF3EB] border-b border-[#E8DCCF] sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle + Global Search Trigger */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Toggle mobile menu"
            className="lg:hidden p-1.5 rounded-md text-stone-600 hover:text-[#2A1E17] hover:bg-black/5"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Input Button (Reference 1 & 2 style) */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-between w-full max-w-sm px-3 py-1.5 rounded-md bg-white border border-[#E8DCCF] text-xs text-stone-400 hover:border-stone-400 transition-colors shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#2A1E17] transition-colors" />
              <span className="text-stone-500 group-hover:text-stone-700">
                Search products, orders, customers...
              </span>
            </div>
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-[#FAF3EB] px-1.5 py-0.5 rounded border border-stone-200 text-stone-500">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Add Product, View Store, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Product Action */}
          <Link href="/admin/products/new">
            <Button
              type="button"
              size="sm"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#C86A28] hover:bg-[#b0581e] text-white text-xs h-8 px-3 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </Button>
          </Link>

          {/* View Storefront Link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#2A1E17] px-2.5 py-1.5 rounded-md hover:bg-black/5 transition-colors font-medium"
          >
            <span>View Store</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-label="Notifications"
              className="relative p-1.5 rounded-md text-stone-600 hover:text-[#2A1E17] hover:bg-black/5 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C86A28]" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E8DCCF] rounded-xl shadow-xl overflow-hidden z-40 animate-in fade-in duration-150">
                <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-[#FAF7F2]">
                  <div className="text-xs font-bold text-[#2A1E17]">Notifications</div>
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs hover:bg-[#FAF7F2] transition-colors cursor-pointer ${
                        n.unread ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-[#2A1E17] flex items-center gap-1.5">
                          {n.type === "order" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {n.type === "alert" && <AlertCircle className="w-3 h-3 text-amber-600" />}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-stone-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-stone-300 hidden sm:block" />

          {/* Admin User Profile Pill (Reference 2 style) */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-7 h-7 rounded-full bg-[#2A1E17] text-[#E59B62] flex items-center justify-center text-xs font-serif font-bold shadow-xs">
              AS
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-semibold text-[#2A1E17] flex items-center gap-1">
                <span>Alexander Sterling</span>
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
              </div>
              <div className="text-[10px] text-stone-500">Super Admin & Retail Lead</div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <AdminGlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
