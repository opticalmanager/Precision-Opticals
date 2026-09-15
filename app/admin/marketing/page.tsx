"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, Calendar, Sparkles, CheckCircle2, Clock, XCircle, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { toast } from "sonner";

export default function AdminMarketingPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Loyalty Program Config
  const [pointsPerHundred, setPointsPerHundred] = useState(1);
  const [rupeesPerPoint, setRupeesPerPoint] = useState(0.5);
  const [savingLoyalty, setSavingLoyalty] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/appointments");
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.warn("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoyaltyConfig = async () => {
    try {
      const res = await fetch("/api/admin/settings?key=loyalty");
      const data = await res.json();
      if (data.success && data.value) {
        if (data.value.pointsPerHundred !== undefined) setPointsPerHundred(data.value.pointsPerHundred);
        if (data.value.rupeesPerPoint !== undefined) setRupeesPerPoint(data.value.rupeesPerPoint);
      }
    } catch (err) {
      console.warn("Failed to load loyalty config:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchLoyaltyConfig();
  }, []);

  const handleSaveLoyalty = async () => {
    setSavingLoyalty(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "loyalty",
          value: { pointsPerHundred, rupeesPerPoint },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Loyalty reward rules saved to database");
      } else {
        toast.error("Failed to save loyalty rules", { description: data.error });
      }
    } catch (e: any) {
      toast.error("Error saving loyalty settings", { description: e.message });
    } finally {
      setSavingLoyalty(false);
    }
  };

  const handleUpdateAppointment = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Appointment marked as ${status}`);
        fetchAppointments();
      }
    } catch (e: any) {
      toast.error("Error updating appointment", { description: e.message });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCCF]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2A1E17] font-serif">
            Marketing & Clinical Appointments
          </h1>
          <p className="text-xs text-stone-500">
            Manage eye examination appointments and Gems loyalty rewards program
          </p>
        </div>
      </div>

      {/* Gems Loyalty Rewards Module */}
      <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C86A28]" />
            <h2 className="text-sm font-bold text-[#2A1E17]">
              Precision Gems Loyalty Rewards Architecture
            </h2>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveLoyalty}
            disabled={savingLoyalty}
            className="text-xs h-7 bg-[#C86A28] hover:bg-[#b0581e] text-white shadow-xs"
          >
            <Save className="w-3 h-3 mr-1" />
            <span>{savingLoyalty ? "Saving..." : "Save Rules"}</span>
          </Button>
        </div>
        <p className="text-xs text-stone-500">
          Tiered rewards engine granting loyalty gems on every verified luxury order.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Gems Earned per ₹100 Spent
            </label>
            <input
              type="number"
              value={pointsPerHundred}
              onChange={(e) => setPointsPerHundred(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Redemption Value (INR ₹ per Gem)
            </label>
            <input
              type="number"
              step="0.1"
              value={rupeesPerPoint}
              onChange={(e) => setRupeesPerPoint(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>
        </div>
      </div>

      {/* Clinical Appointments Queue */}
      <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C86A28]" />
            <h2 className="text-sm font-bold text-[#2A1E17]">
              Clinical Eye Exam Bookings
            </h2>
          </div>
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-lg border border-[#E8DCCF] text-[11px]">
            {["all", "pending", "confirmed", "completed"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setAppointmentFilter(tab)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors cursor-pointer ${
                  appointmentFilter === tab
                    ? "bg-white text-[#2A1E17] font-bold shadow-2xs border border-[#E8DCCF]"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#C86A28] animate-spin" />
          </div>
        ) : appointments.filter((a) => appointmentFilter === "all" || a.status === appointmentFilter).length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">
            No clinical appointments match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="pb-2.5">Reference</th>
                  <th className="pb-2.5">Patient Details</th>
                  <th className="pb-2.5">Service Requested</th>
                  <th className="pb-2.5">Clinic Location</th>
                  <th className="pb-2.5">Date & Time</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {appointments
                  .filter((a) => appointmentFilter === "all" || a.status === appointmentFilter)
                  .map((a) => (
                    <tr key={a.id} className="hover:bg-[#FAF7F2]/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-[#2A1E17]">
                      {a.booking_reference}
                    </td>

                    <td className="py-3">
                      <div className="font-bold text-stone-800">{a.patient_name}</div>
                      <div className="text-[10px] text-stone-500">{a.patient_phone}</div>
                    </td>

                    <td className="py-3 font-medium text-stone-700">
                      {a.service}
                    </td>

                    <td className="py-3 text-stone-600 max-w-xs truncate">
                      {a.store_location}
                    </td>

                    <td className="py-3">
                      <div className="font-semibold text-stone-800">
                        {new Date(a.appointment_date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-stone-500">{a.time_slot}</div>
                    </td>

                    <td className="py-3">
                      <StatusBadge status={a.status} size="sm" />
                    </td>

                    <td className="py-3 text-right">
                      {a.status !== "confirmed" && a.status !== "completed" ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleUpdateAppointment(a.id, "confirmed")}
                          className="text-[11px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Confirm
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Confirmed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
