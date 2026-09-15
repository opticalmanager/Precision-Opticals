"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sliders,
  Store,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function AdminSettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState(tabParam);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // General store settings state
  const [generalConfig, setGeneralConfig] = useState({
    storeName: "Precision Optics (Estd. 1969)",
    tagline: "Luxury Eyewear & Clinical Optometry Atelier",
    email: "concierge@precisionoptics.in",
    phone: "+91 98100 12345",
    currency: "INR (₹)",
    operatingHours: "Monday - Sunday: 10:30 AM - 08:30 PM",
    address: "JMD Regent Arcade, Sector 104, Golf Course Road, Gurugram, Haryana - 122002",
  });

  // Notifications state
  const [notificationsConfig, setNotificationsConfig] = useState({
    orderEmail: true,
    labAssemblyWhatsApp: true,
    dispatchSms: true,
    lowStockStaffAlert: true,
  });

  // Roles state
  const roles = [
    {
      name: "Alexander Sterling",
      email: "a.sterling@precisionoptics.com",
      role: "Super Admin",
      status: "Active",
    },
    {
      name: "Dr. R. K. Malhotra",
      email: "malhotra.optometry@precisionoptics.com",
      role: "Master Optician & Lab Lead",
      status: "Active",
    },
    {
      name: "Rhea Sen",
      email: "rhea.catalog@precisionoptics.com",
      role: "Catalog Manager",
      status: "Active",
    },
    {
      name: "Devendra Verma",
      email: "d.verma@precisionoptics.com",
      role: "Order Fulfillment Manager",
      status: "Active",
    },
  ];

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "general", value: generalConfig }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved successfully");
      }
    } catch (e: any) {
      toast.error("Error saving settings", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const navItems = [
    { id: "general", label: "General Settings", icon: Sliders },
    { id: "store", label: "Store & Atelier Policy", icon: Store },
    { id: "payments", label: "Payment Methods", icon: CreditCard, externalHref: "/admin/payments" },
    { id: "shipping", label: "Shipping & Transit", icon: Truck, externalHref: "/admin/shipping" },
    { id: "notifications", label: "Notification Channels", icon: Bell },
    { id: "roles", label: "Admin Users & Roles", icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="pb-3 border-b border-[#E8DCCF]">
        <h1 className="text-xl font-bold tracking-tight text-[#2A1E17] font-serif">
          Administration Settings
        </h1>
        <p className="text-xs text-stone-500">
          Global boutique configuration, legal operating identities, and staff permissions
        </p>
      </div>

      {/* Two-Level Settings Layout (Reference 1 Inspiration) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Subnav */}
        <div className="md:col-span-1 space-y-1">
          <div className="bg-white border border-[#E8DCCF] rounded-xl p-2 shadow-2xs space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (item.externalHref) {
                return (
                  <Link
                    key={item.id}
                    href={item.externalHref}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-[#2A1E17] hover:bg-stone-50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-stone-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? "bg-[#FAF3EB] text-[#2A1E17] font-bold border border-[#E8DCCF]"
                      : "text-stone-600 hover:text-[#2A1E17] hover:bg-stone-50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#C86A28]" : "text-stone-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Focused Content Area */}
        <div className="md:col-span-3">
          {activeTab === "general" && (
            <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h2 className="text-sm font-bold text-[#2A1E17]">General Boutique Profile</h2>
                  <p className="text-xs text-stone-500">
                    Primary commercial identity printed on customer invoices and laboratory slips
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveGeneral}
                  disabled={saving}
                  className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  <span>Save</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Store / Atelier Legal Name
                  </label>
                  <input
                    type="text"
                    value={generalConfig.storeName}
                    onChange={(e) =>
                      setGeneralConfig({ ...generalConfig, storeName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Concierge Support Email
                  </label>
                  <input
                    type="email"
                    value={generalConfig.email}
                    onChange={(e) =>
                      setGeneralConfig({ ...generalConfig, email: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Direct VIP Telephone
                  </label>
                  <input
                    type="text"
                    value={generalConfig.phone}
                    onChange={(e) =>
                      setGeneralConfig({ ...generalConfig, phone: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={generalConfig.operatingHours}
                    onChange={(e) =>
                      setGeneralConfig({ ...generalConfig, operatingHours: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-700 font-semibold mb-1">
                    Flagship Atelier Physical Address
                  </label>
                  <input
                    type="text"
                    value={generalConfig.address}
                    onChange={(e) =>
                      setGeneralConfig({ ...generalConfig, address: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "store" && (
            <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#2A1E17]">Store & Optical Policies</h2>
                <p className="text-xs text-stone-500">
                  Prescription verification regulations and clinical warranty terms
                </p>
              </div>

              <div className="space-y-3 text-xs pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DCCF]">
                  <div>
                    <div className="font-bold text-[#2A1E17]">
                      Mandatory Optician Verification for Rx &ge; 4.00 D
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      Requires tele-optometry confirmation with patient before lab edging.
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-[#C86A28]" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DCCF]">
                  <div>
                    <div className="font-bold text-[#2A1E17]">
                      2-Year Titanium Frame Craftsmanship Warranty
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      Complimentary screw tightening, ultrasonic bath, and nose pad replacements.
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-[#C86A28]" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#2A1E17]">Automated Notification Channels</h2>
                <p className="text-xs text-stone-500">
                  Patron updates dispatched during laboratory edging and courier transit
                </p>
              </div>

              <div className="space-y-2.5 text-xs pt-2 border-t border-stone-100">
                <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DCCF] cursor-pointer">
                  <div>
                    <span className="font-bold text-[#2A1E17] block">
                      Order Placement Email with High-Res Receipt
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Dispatched instantly to guest/member email
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsConfig.orderEmail}
                    onChange={(e) =>
                      setNotificationsConfig({ ...notificationsConfig, orderEmail: e.target.checked })
                    }
                    className="rounded text-[#C86A28]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DCCF] cursor-pointer">
                  <div>
                    <span className="font-bold text-[#2A1E17] block">
                      WhatsApp Lab Milestone Notification
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Sends video/photo verification when frame passes optician inspection
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsConfig.labAssemblyWhatsApp}
                    onChange={(e) =>
                      setNotificationsConfig({
                        ...notificationsConfig,
                        labAssemblyWhatsApp: e.target.checked,
                      })
                    }
                    className="rounded text-[#C86A28]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DCCF] cursor-pointer">
                  <div>
                    <span className="font-bold text-[#2A1E17] block">
                      Internal Low-Stock Staff Alerts
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Alerts master optician when luxury frames hit 5 or fewer units
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsConfig.lowStockStaffAlert}
                    onChange={(e) =>
                      setNotificationsConfig({
                        ...notificationsConfig,
                        lowStockStaffAlert: e.target.checked,
                      })
                    }
                    className="rounded text-[#C86A28]"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#2A1E17]">
                  Administrative Staff & Security Roles
                </h2>
                <p className="text-xs text-stone-500">
                  Manage personnel access, laboratory technicians, and catalog privileges
                </p>
              </div>

              <div className="overflow-x-auto pt-2 border-t border-stone-100">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      <th className="pb-2.5">Staff Member</th>
                      <th className="pb-2.5">Email</th>
                      <th className="pb-2.5">Role</th>
                      <th className="pb-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {roles.map((r, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-bold text-[#2A1E17]">{r.name}</td>
                        <td className="py-2.5 text-stone-600">{r.email}</td>
                        <td className="py-2.5 font-medium text-purple-700">{r.role}</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-[#C86A28] animate-spin" />
        </div>
      }
    >
      <AdminSettingsContent />
    </Suspense>
  );
}
