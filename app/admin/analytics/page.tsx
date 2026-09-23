"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag, Eye, Users, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard?range=all")
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
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
  };

  const topProducts = data?.topProducts || [];
  const brandBreakdown = data?.brandBreakdown || [];
  const lensBreakdown = data?.lensBreakdown || {
    total: 0,
    progressivePercent: 0,
    blueCutPercent: 0,
    frameOnlyPercent: 0,
    progressiveCount: 0,
    blueCutCount: 0,
    frameOnlyCount: 0,
  };

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
          {stats.revenueGrowth ? (
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{stats.revenueGrowth} vs prior period</span>
            </div>
          ) : (
            <div className="text-[11px] text-stone-400 mt-1">Verified gross turnover</div>
          )}
        </div>

        <div className="bg-white border border-[#E8DCCF] rounded-xl p-4 shadow-2xs">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-[#C86A28]" />
            <span>Total Orders Fulfilled</span>
          </div>
          <div className="text-2xl font-bold text-[#2A1E17]">{stats.totalOrders}</div>
          {stats.ordersGrowth ? (
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{stats.ordersGrowth} volume</span>
            </div>
          ) : (
            <div className="text-[11px] text-stone-400 mt-1">Orders in atelier pipeline</div>
          )}
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
          <div className="text-[11px] text-stone-500 mt-1">
            Registered customer accounts & guests
          </div>
        </div>
      </div>

      {/* Optical Specific Analytics breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Prescription vs Plano Demo Lenses */}
        <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2A1E17]">
              Prescription Lenses vs Plano Frames
            </h3>
            <span className="text-[11px] font-medium text-stone-500">
              {lensBreakdown.total} configured lenses
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Real order share fitted with surfaced corrective lenses versus demo frames.
          </p>

          {lensBreakdown.total === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              No prescription lens configurations logged yet.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>Progressive & Freeform Optics ({lensBreakdown.progressiveCount})</span>
                  <span>{lensBreakdown.progressivePercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-[#C86A28] rounded-full transition-all duration-500"
                    style={{ width: `${lensBreakdown.progressivePercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>Single-Vision & Blue-Cut Screens ({lensBreakdown.blueCutCount})</span>
                  <span>{lensBreakdown.blueCutPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${lensBreakdown.blueCutPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>Demo Lenses / Frame Only ({lensBreakdown.frameOnlyCount})</span>
                  <span>{lensBreakdown.frameOnlyPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-stone-400 rounded-full transition-all duration-500"
                    style={{ width: `${lensBreakdown.frameOnlyPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Brand Performance Ranking */}
        <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#2A1E17]">Top Eyewear Maisons by Revenue</h3>
          <p className="text-xs text-stone-500">Gross revenue generated across brands in actual orders</p>

          <div className="space-y-2.5 pt-2">
            {brandBreakdown && brandBreakdown.length > 0 ? (
              brandBreakdown.map((b: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF7F2] text-xs border border-stone-100"
                >
                  <div>
                    <span className="font-bold text-[#2A1E17] block">{b.brand_name}</span>
                    <span className="text-[11px] text-stone-500">{b.units_sold} units sold</span>
                  </div>
                  <span className="font-bold text-[#2A1E17]">
                    {formatCurrency(Number(b.total_revenue))}
                  </span>
                </div>
              ))
            ) : topProducts && topProducts.length > 0 ? (
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
