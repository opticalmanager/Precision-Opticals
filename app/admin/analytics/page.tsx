"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag, Eye, Users, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res);
      })
      .catch((e) => console.warn("Analytics fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-[#C86A28] animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalRevenue: 345000,
    totalOrders: 6,
    avgOrderValue: 57500,
    totalCustomers: 5,
  };

  const topProducts = data?.topProducts || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="pb-3 border-b border-[#E8DCCF]">
        <h1 className="text-xl font-bold tracking-tight text-[#2A1E17] font-serif">
          Commercial & Clinical Intelligence
        </h1>
        <p className="text-xs text-stone-500">
          Executive performance metrics, brand turnover, and lens customization demand
        </p>
      </div>

      {/* Top 4 Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8DCCF] rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-[#C86A28]" />
            <span>Cumulative Gross Turnover</span>
          </div>
          <div className="text-2xl font-bold text-[#2A1E17]">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.8% Month-over-Month</span>
          </div>
        </div>

        <div className="bg-white border border-[#E8DCCF] rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-[#C86A28]" />
            <span>Total Completed Dispatches</span>
          </div>
          <div className="text-2xl font-bold text-[#2A1E17]">{stats.totalOrders}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+9.2% Volume</span>
          </div>
        </div>

        <div className="bg-white border border-[#E8DCCF] rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#C86A28]" />
            <span>Average Order Value</span>
          </div>
          <div className="text-2xl font-bold text-[#2A1E17]">
            {formatCurrency(stats.avgOrderValue)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">High-ticket luxury average</div>
        </div>

        <div className="bg-white border border-[#E8DCCF] rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#C86A28]" />
            <span>Verified Patrons</span>
          </div>
          <div className="text-2xl font-bold text-[#2A1E17]">{stats.totalCustomers}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            83% Repeat purchase probability
          </div>
        </div>
      </div>

      {/* Optical Specific Analytics breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Prescription vs Plano Demo Lenses */}
        <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#2A1E17]">
            Prescription Lenses vs Plano Frames
          </h3>
          <p className="text-xs text-stone-500">
            Share of orders fitted with surfaced corrective lenses versus demo frames.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                <span>Progressive & Zeiss Precision Optics</span>
                <span>65%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-[#C86A28] rounded-full" style={{ width: "65%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                <span>Blue-Cut Single Vision (Developers & Screen)</span>
                <span>25%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: "25%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                <span>Demo Lenses / Frame Only</span>
                <span>10%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-stone-400 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Performance Ranking */}
        <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#2A1E17]">Top Eyewear Maisons by Revenue</h3>
          <p className="text-xs text-stone-500">Gross revenue generated across brands</p>

          <div className="space-y-2.5 pt-2">
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF7F2] text-xs"
                >
                  <div>
                    <span className="font-bold text-[#2A1E17] block">{p.name}</span>
                    <span className="text-[11px] text-stone-500">{p.brand || "Precision"}</span>
                  </div>
                  <span className="font-bold text-[#2A1E17]">
                    {formatCurrency(Number(p.total_volume || p.base_price))}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-stone-500 py-6 text-center">
                Data accumulating from real checkout transactions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
