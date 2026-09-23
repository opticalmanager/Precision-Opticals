"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  Wrench,
  ShieldCheck,
  Send,
  Loader2,
  Save,
  FileText,
  User,
  MapPin,
  CreditCard,
  Glasses,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState(false);

  // Editable fields
  const [newStatus, setNewStatus] = useState("");
  const [courierPartner, setCourierPartner] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setNewStatus(data.order.status);
        setCourierPartner(data.order.courier_partner || "BlueDart Express");
        setTrackingNumber(data.order.tracking_number || "");
      }
    } catch (err) {
      console.warn("Failed to fetch order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrderDetail();
  }, [id]);

  const handleUpdateOrder = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          courierPartner,
          trackingNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order status updated successfully", {
          description: `Order is now in ${newStatus.replace(/_/g, " ")}.`,
        });
        fetchOrderDetail();
      } else {
        toast.error("Failed to update order", { description: data.error });
      }
    } catch (err: any) {
      toast.error("Update error", { description: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const labSteps = [
    { id: "confirmed", label: "Order Confirmed", icon: Clock },
    { id: "optician_assembly", label: "Optician Assembly", icon: Wrench },
    { id: "quality_check", label: "Quality Check", icon: ShieldCheck },
    { id: "dispatched", label: "Dispatched", icon: Send },
    { id: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const currentStepIndex = labSteps.findIndex((s) => s.id === order?.status);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-[#C86A28] animate-spin" />
        <span className="text-xs text-stone-500 font-medium">Loading optical order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-xs text-stone-500">
        Order not found in database.
      </div>
    );
  }

  const shipping = order.shipping_address || {};
  const items = order.items || [];

  return (
    <>
      <div className="space-y-5 animate-in fade-in duration-200 print:hidden">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCCF]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            className="p-1.5 rounded-md hover:bg-black/5 text-stone-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#2A1E17] font-serif">
                Order {order.order_number}
              </h1>
              <StatusBadge status={order.status} size="sm" />
              <StatusBadge status={order.payment_status} size="sm" />
            </div>
            <p className="text-xs text-stone-500">
              Placed on {new Date(order.created_at).toLocaleString("en-IN")} • Tracking:{" "}
              <span className="font-mono text-stone-700">{order.tracking_number}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs bg-white border-stone-300"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            <span>Print Invoice</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleUpdateOrder}
            disabled={updating}
            className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white shadow-xs"
          >
            {updating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1" />
            )}
            <span>Save Updates</span>
          </Button>
        </div>
      </div>

      {/* Optical Lab Workflow Stepper */}
      <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs">
        <div className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-4 flex items-center justify-between">
          <span>Optical Laboratory Workflow Progress</span>
          <span className="text-stone-400 font-normal">
            Stage {Math.max(1, currentStepIndex + 1)} of 5
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 relative">
          {labSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={step.id}
                onClick={() => setNewStatus(step.id)}
                className={`flex flex-col items-center text-center p-2 rounded-lg cursor-pointer transition-all ${
                  isCurrent
                    ? "bg-[#FAF3EB] border border-[#C86A28] font-bold text-[#2A1E17]"
                    : isCompleted
                    ? "text-emerald-700 hover:bg-emerald-50"
                    : "text-stone-400 hover:bg-stone-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                    isCurrent
                      ? "bg-[#C86A28] text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] leading-tight">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Items + Rx, Right Customer & Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Ordered Items & Optical Prescriptions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ordered Products */}
          <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#2A1E17] flex items-center gap-2">
              <Glasses className="w-4 h-4 text-[#C86A28]" />
              <span>Eyewear & Lens Specifications</span>
            </h3>

            <div className="divide-y divide-stone-100">
              {items.map((it: any, idx: number) => {
                const snap = it.product_snapshot || {};
                const rx = snap.prescription;

                return (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-[#2A1E17]">
                          {snap.name || "Precision Luxury Eyewear"}
                        </div>
                        <div className="text-xs text-stone-500">
                          Finish: <span className="font-medium text-stone-800">{snap.color || "Standard"}</span> • Lens Option:{" "}
                          <span className="font-medium text-stone-800">
                            {snap.lensPackage || snap.lensType || "Demo Plastic"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm text-[#2A1E17]">
                          {formatCurrency(Number(it.total_price))}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Qty: {it.quantity} • Frame: {formatCurrency(Number(it.unit_price))} + Lens:{" "}
                          {formatCurrency(Number(it.lens_price || 0))}
                        </div>
                      </div>
                    </div>

                    {/* Prescription Table if available */}
                    {rx && (
                      <div className="bg-[#FAF7F2] border border-[#E8DCCF] rounded-lg p-3 text-xs">
                        <div className="font-bold text-[#2A1E17] mb-2 flex items-center justify-between">
                          <span className="uppercase tracking-wider text-[10px] text-stone-600">
                            Verified Clinical Eye Power (Rx)
                          </span>
                          <span className="text-[11px] font-mono text-[#C86A28]">
                            PD: {rx.pd} mm
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-2.5 rounded border border-stone-200">
                            <span className="font-bold text-stone-700 block mb-1 text-[11px]">
                              Right Eye (OD)
                            </span>
                            <div className="grid grid-cols-4 gap-1 text-[11px] font-mono text-center">
                              <div>
                                <span className="text-[9px] text-stone-400 block">SPH</span>
                                {rx.rightEye?.sph || "0.00"}
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 block">CYL</span>
                                {rx.rightEye?.cyl || "0.00"}
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 block">AXIS</span>
                                {rx.rightEye?.axis || "0"}°
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 block">ADD</span>
                                {rx.rightEye?.add || "—"}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-2.5 rounded border border-stone-200">
                            <span className="font-bold text-stone-700 block mb-1 text-[11px]">
                              Left Eye (OS)
                            </span>
                            <div className="grid grid-cols-4 gap-1 text-[11px] font-mono text-center">
                              <div>
                                <span className="text-[9px] text-stone-400 block">SPH</span>
                                {rx.leftEye?.sph || "0.00"}
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 block">CYL</span>
                                {rx.leftEye?.cyl || "0.00"}
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 block">AXIS</span>
                                {rx.leftEye?.axis || "0"}°
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 block">ADD</span>
                                {rx.leftEye?.add || "—"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier & Tracking Assignment */}
          <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#2A1E17] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C86A28]" />
              <span>Logistics & Courier Assignment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Courier Partner
                </label>
                <input
                  type="text"
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Airway Bill / Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs font-mono text-[#2A1E17]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Financial Summary */}
        <div className="space-y-4">
          {/* Customer Profile Card */}
          <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#2A1E17] flex items-center gap-2">
              <User className="w-4 h-4 text-[#C86A28]" />
              <span>Patron Information</span>
            </h3>

            <div className="text-xs space-y-1.5">
              <div className="font-bold text-[#2A1E17]">
                {shipping.fullName || "Guest Patron"}
              </div>
              <div className="text-stone-600">{order.guest_email}</div>
              <div className="text-stone-600 font-mono">{order.guest_phone}</div>
            </div>

            <div className="pt-2 border-t border-stone-100 text-xs space-y-1">
              <div className="font-semibold text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Shipping Address</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed pl-5">
                {shipping.streetAddress}, {shipping.city}, {shipping.state} - {shipping.pincode},{" "}
                {shipping.country || "India"}
              </p>
            </div>
          </div>

          {/* Payment & Financial Ledger */}
          <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#2A1E17] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C86A28]" />
              <span>Financial Ledger</span>
            </h3>

            <div className="space-y-2 text-stone-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#2A1E17]">
                  {formatCurrency(Number(order.subtotal))}
                </span>
              </div>

              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({order.coupon_code || "Special Offer"})</span>
                  <span>-{formatCurrency(Number(order.discount_amount))}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Insured Express Shipping</span>
                <span className="text-emerald-700 font-medium">Free</span>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-[#2A1E17]">
                <span>Total Amount Paid</span>
                <span>{formatCurrency(Number(order.total_amount))}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Method</span>
                <span className="font-semibold text-stone-800 uppercase">
                  {order.payment_method === "upi"
                    ? "Razorpay UPI"
                    : order.payment_method === "card"
                    ? "Razorpay Cards"
                    : order.payment_method === "netbanking"
                    ? "Razorpay NetBanking"
                    : "Cash on Delivery"}
                </span>
              </div>

              {order.payment_id && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-stone-500">Gateway Txn ID</span>
                  <div className="flex items-center gap-1 font-mono text-[11px] text-[#2A1E17]">
                    <span className="font-bold">{order.payment_id}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(order.payment_id);
                        setCopiedTxId(true);
                        toast.success("Transaction ID copied");
                        setTimeout(() => setCopiedTxId(false), 2000);
                      }}
                      className="text-stone-400 hover:text-stone-700 transition-colors p-0.5 cursor-pointer"
                      title="Copy transaction ID"
                    >
                      {copiedTxId ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {order.payment_details?.razorpay_order_id && (
                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                  <span>Gateway Order</span>
                  <span className="font-mono">{order.payment_details.razorpay_order_id}</span>
                </div>
              )}

              {order.payment_id && order.payment_status === "paid" && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>HMAC-SHA256 Cryptographically Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Printable Luxury Optical Tax Invoice & Lab Dispatch Slip */}
      <div className="hidden print:block p-8 bg-white text-black font-sans max-w-4xl mx-auto">
        {/* Atelier Letterhead */}
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase font-serif">
              Precision Optics
            </h1>
            <p className="text-xs tracking-widest uppercase font-semibold text-stone-700">
              Luxury Eyewear Atelier & Clinical Optometry • Estd. 1969
            </p>
            <p className="text-[11px] text-stone-600 mt-1 max-w-md">
              Regd. Office: JMD Regent Arcade, Sector 104, Golf Course Road, Gurugram, Haryana - 122002
              <br />
              GSTIN: 06AAACP1234F1Z8 | CIN: U33201HR1969PTC091240 | concierge@precisionoptics.in
            </p>
          </div>
          <div className="text-right">
            <div className="text-base font-bold uppercase tracking-wider">
              Tax Invoice
            </div>
            <div className="text-xs font-mono font-semibold mt-0.5">
              INV-{order.order_number}
            </div>
            <div className="text-[11px] text-stone-600">
              Date: {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Bill To & Dispatch Details */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-xs border border-stone-300 p-4 rounded">
          <div>
            <div className="font-bold uppercase tracking-wider text-[10px] text-stone-500 mb-1">
              Billed & Shipped To:
            </div>
            <div className="font-bold text-sm text-black">
              {shipping.fullName || "Valued Patron"}
            </div>
            <div className="text-stone-700 mt-0.5">
              {shipping.streetAddress}
              <br />
              {shipping.city}, {shipping.state} - {shipping.pincode}
              <br />
              India
            </div>
            <div className="text-stone-600 font-mono mt-1">
              Phone: {order.guest_phone || shipping.phone}
            </div>
            <div className="text-stone-600">Email: {order.guest_email}</div>
          </div>

          <div className="text-right">
            <div className="font-bold uppercase tracking-wider text-[10px] text-stone-500 mb-1">
              Dispatch & Logistics:
            </div>
            <div>
              <span className="font-semibold">Courier Partner:</span> {order.courier_partner || courierPartner || "BlueDart Express"}
            </div>
            <div>
              <span className="font-semibold">Airway Bill / AWB:</span>{" "}
              <span className="font-mono">{order.tracking_number || trackingNumber || "Pending Dispatch"}</span>
            </div>
            <div>
              <span className="font-semibold">Payment Mode:</span> {order.payment_method?.toUpperCase()}
            </div>
            <div>
              <span className="font-semibold">Payment Status:</span> {order.payment_status?.toUpperCase()}
            </div>
            {order.payment_id && (
              <div>
                <span className="font-semibold">Gateway Txn Ref:</span>{" "}
                <span className="font-mono">{order.payment_id}</span>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Optical Products Table */}
        <div className="mb-6">
          <table className="w-full text-xs text-left border border-black border-collapse">
            <thead>
              <tr className="bg-stone-100 border-b border-black text-[10px] uppercase font-bold">
                <th className="p-2 border-r border-black">S.No</th>
                <th className="p-2 border-r border-black">Item Description & Finish</th>
                <th className="p-2 border-r border-black">HSN Code</th>
                <th className="p-2 border-r border-black text-center">Qty</th>
                <th className="p-2 border-r border-black text-right">Unit Rate (₹)</th>
                <th className="p-2 text-right">Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any, idx: number) => {
                const snap = it.product_snapshot || {};
                return (
                  <tr key={idx} className="border-b border-stone-300">
                    <td className="p-2 border-r border-stone-300 font-mono text-center">
                      {idx + 1}
                    </td>
                    <td className="p-2 border-r border-stone-300">
                      <div className="font-bold">{snap.name || "Luxury Frame"}</div>
                      <div className="text-[10px] text-stone-600">
                        Finish: {snap.color || "Standard"} | Lens: {snap.lensPackage || snap.lensType || "Plano Demonstration"}
                      </div>
                    </td>
                    <td className="p-2 border-r border-stone-300 font-mono text-[10px]">
                      90031100
                    </td>
                    <td className="p-2 border-r border-stone-300 text-center font-mono">
                      {it.quantity}
                    </td>
                    <td className="p-2 border-r border-stone-300 text-right font-mono">
                      {formatCurrency(Number(it.unit_price) + Number(it.lens_price || 0))}
                    </td>
                    <td className="p-2 text-right font-bold font-mono">
                      {formatCurrency(Number(it.total_price))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Clinical Eye Power Rx Summary on Invoice */}
        {items.some((it: any) => it.product_snapshot?.prescription) && (
          <div className="border border-stone-400 p-3 mb-6 bg-stone-50 text-xs">
            <div className="font-bold uppercase tracking-wider text-[10px] mb-2 text-stone-700">
              Verified Optical Prescription Specifications (Rx)
            </div>
            {items
              .filter((it: any) => it.product_snapshot?.prescription)
              .map((it: any, idx: number) => {
                const rx = it.product_snapshot.prescription;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="text-[11px] font-semibold text-stone-800">
                      Frame: {it.product_snapshot.name} (PD: {rx.pd} mm)
                    </div>
                    <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                      <div>
                        Right Eye (OD): SPH {rx.rightEye?.sph || "0.00"} | CYL {rx.rightEye?.cyl || "0.00"} | AXIS {rx.rightEye?.axis || "0"}° | ADD {rx.rightEye?.add || "—"}
                      </div>
                      <div>
                        Left Eye (OS): SPH {rx.leftEye?.sph || "0.00"} | CYL {rx.leftEye?.cyl || "0.00"} | AXIS {rx.leftEye?.axis || "0"}° | ADD {rx.leftEye?.add || "—"}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Financial Summary & Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 text-xs space-y-1.5 border-t border-b border-black py-3">
            <div className="flex justify-between">
              <span className="text-stone-600">Taxable Value:</span>
              <span className="font-mono">
                {formatCurrency(Math.round(Number(order.total_amount) / 1.18))}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-stone-600">CGST (9.0%):</span>
              <span className="font-mono">
                {formatCurrency(Math.round((Number(order.total_amount) / 1.18) * 0.09))}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-stone-600">SGST (9.0%):</span>
              <span className="font-mono">
                {formatCurrency(Math.round((Number(order.total_amount) / 1.18) * 0.09))}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-stone-600">Insured Shipping:</span>
              <span className="font-mono text-emerald-700 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-sm border-t border-black pt-1.5">
              <span>Total Invoice Amount:</span>
              <span className="font-mono">{formatCurrency(Number(order.total_amount))}</span>
            </div>
          </div>
        </div>

        {/* Signatures & Seal */}
        <div className="grid grid-cols-2 gap-8 text-xs pt-4 border-t border-stone-200">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
              Terms & Conditions:
            </div>
            <p className="text-[9px] text-stone-500 leading-normal mt-0.5">
              1. Custom Rx Zeiss progressive lenses are surfaced specifically for the patron&apos;s optometric measurements.
              <br />
              2. Titanium frames carry a 24-month comprehensive manufacturing warranty.
              <br />
              3. This is a computer-generated luxury atelier tax invoice.
            </p>
          </div>
          <div className="text-right flex flex-col items-end justify-end">
            <div className="w-36 border-b border-black mb-1"></div>
            <div className="font-bold text-xs uppercase">For Precision Optics</div>
            <div className="text-[10px] text-stone-500">Authorized Optician & Signatory</div>
          </div>
        </div>
      </div>
    </>
  );
}
