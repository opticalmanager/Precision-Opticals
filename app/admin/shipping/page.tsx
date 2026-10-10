"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  ShieldCheck,
  Save,
  Loader2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Radio,
  Package,
  Layers,
  Webhook,
  Activity,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminShippingPage() {
  const [shippingConfig, setShippingConfig] = useState<any>({
    freeShippingThreshold: 5000,
    standardShippingFee: 250,
    expressShippingFee: 490,
    defaultCarrier: "BlueDart Express",
    supportedCarriers: ["BlueDart Express", "Delhivery Air", "DTDC Priority Air"],
    enableWhiteGloveHomeTrial: true,
    trialDepositAmount: 3000,

    // Shiprocket Settings
    shiprocketEmail: "precisionoptics7@gmail.com",
    shiprocketPassword: "Precision@2026",
    shiprocketPickupLocation: "precision optics",
    shiprocketPickupAddress: "GF-45D, Spectrum metro mall, Phase-1, Sector 75",
    shiprocketPickupCity: "Noida",
    shiprocketPickupState: "Uttar Pradesh",
    shiprocketPickupPincode: "201316",
    shiprocketWebhookSecret: "prec_shiprocket_sec_2026",
    fulfillmentMode: "manual_1click",
    defaultWeightKg: 0.35,
    packageDimensions: {
      length: 18,
      breadth: 12,
      height: 8,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    connected: boolean;
    message?: string;
  }>({
    tested: false,
    connected: false,
  });

  const webhookUrl = "https://precision-opticals.vercel.app/api/webhooks/delivery";

  useEffect(() => {
    fetch("/api/admin/settings?key=shipping")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.value) {
          setShippingConfig((prev: any) => ({
            ...prev,
            ...data.value,
            packageDimensions: {
              ...prev.packageDimensions,
              ...(data.value.packageDimensions || {}),
            },
          }));
        }
      })
      .catch((e) => console.warn("Failed to fetch shipping settings:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "shipping", value: shippingConfig }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shipping & Shiprocket logistics rules saved successfully");
      } else {
        toast.error("Failed to save rules", { description: data.error });
      }
    } catch (e: any) {
      toast.error("Save error", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await fetch("/api/admin/shipping/shiprocket");
      const data = await res.json();
      setConnectionStatus({
        tested: true,
        connected: data.connected,
        message: data.message,
      });

      if (data.connected) {
        toast.success("Shiprocket API Connected", {
          description: "Live connection verified successfully.",
        });
      } else {
        toast.info("Shiprocket Credentials Stored", {
          description: data.message || "Ensure API User is configured in Shiprocket dashboard.",
        });
      }
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        connected: false,
        message: err.message || "Network error while connecting to Shiprocket",
      });
      toast.error("Connection Test Failed", { description: err.message });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    toast.success("Webhook URL copied to clipboard");
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-[#C86A28] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DCCF]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2A1E17] font-serif">
            Shipping &amp; Logistics Operating Center
          </h1>
          <p className="text-xs text-stone-500">
            Configure Shiprocket carrier routing, live rates, optical lab dispatch gates, and webhook synchronization
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="text-xs bg-[#C86A28] hover:bg-[#b0581e] text-white shadow-xs"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
          <span>Save Configuration</span>
        </Button>
      </div>

      {/* 1. Shiprocket Logistics Gateway Integration Card */}
      <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#FAF3EB] border border-[#E8DCCF] flex items-center justify-center text-[#C86A28]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#2A1E17]">Shiprocket API Gateway</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Primary Logistics Provider
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Multi-courier air dispatch (BlueDart, Delhivery, DTDC) with automated AWB generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="text-xs h-8 border-[#E8DCCF] text-stone-700 bg-[#FAF7F2] hover:bg-stone-100"
            >
              {testingConnection ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#C86A28]" />
              ) : (
                <Activity className="w-3.5 h-3.5 mr-1.5 text-[#C86A28]" />
              )}
              <span>Test API Connection</span>
            </Button>
          </div>
        </div>

        {/* Connection Status Pill if Tested */}
        {connectionStatus.tested && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              connectionStatus.connected
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {connectionStatus.connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <div className="font-semibold">
                {connectionStatus.connected
                  ? "Shiprocket API Connected & Active"
                  : "Shiprocket API Credentials Stored"}
              </div>
              <div className="text-[11px] leading-relaxed">
                {connectionStatus.message ||
                  (connectionStatus.connected
                    ? "Live rates and AWB dispatch are operational."
                    : "If login returns invalid combination, configure an API User in Shiprocket Dashboard -> Settings -> API -> Configure API Users.")}
              </div>
            </div>
          </div>
        )}

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Shiprocket API Email
            </label>
            <input
              type="email"
              value={shippingConfig.shiprocketEmail || ""}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  shiprocketEmail: e.target.value,
                })
              }
              placeholder="pprecisionoptics7@gmail.com"
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Shiprocket API Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={shippingConfig.shiprocketPassword || ""}
                onChange={(e) =>
                  setShippingConfig({
                    ...shippingConfig,
                    shiprocketPassword: e.target.value,
                  })
                }
                placeholder="API Password"
                className="w-full px-3 py-1.5 pr-8 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Primary Atelier Pickup Location & Dispatch Point */}
        <div className="pt-3 border-t border-stone-100 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C86A28]" />
              <span>Primary Atelier Pickup Location (Shiprocket Consignment Origin)</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setShippingConfig({
                  ...shippingConfig,
                  shiprocketPickupLocation: "precision optics",
                  shiprocketPickupAddress: "GF-45D, Spectrum metro mall, Phase-1, Sector 75",
                  shiprocketPickupCity: "Noida",
                  shiprocketPickupState: "Uttar Pradesh",
                  shiprocketPickupPincode: "201316",
                })
              }
              className="text-[11px] font-bold text-[#C86A28] hover:underline cursor-pointer"
            >
              Load Spectrum Metro Mall (Noida 201316)
            </button>
          </div>

          <p className="text-[11px] text-stone-500 leading-relaxed">
            This pickup address is passed to Shiprocket as the dispatch origin when assigning AWBs and scheduling courier pickups.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Pickup Location Nickname
              </label>
              <input
                type="text"
                value={shippingConfig.shiprocketPickupLocation || ""}
                onChange={(e) =>
                  setShippingConfig({
                    ...shippingConfig,
                    shiprocketPickupLocation: e.target.value,
                  })
                }
                placeholder="precision optics"
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-stone-700 font-semibold mb-1">
                Street Address / Mall Unit
              </label>
              <input
                type="text"
                value={shippingConfig.shiprocketPickupAddress || ""}
                onChange={(e) =>
                  setShippingConfig({
                    ...shippingConfig,
                    shiprocketPickupAddress: e.target.value,
                  })
                }
                placeholder="GF-45D, Spectrum metro mall, Phase-1, Sector 75"
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Postal PIN Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={shippingConfig.shiprocketPickupPincode || ""}
                onChange={(e) =>
                  setShippingConfig({
                    ...shippingConfig,
                    shiprocketPickupPincode: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="201316"
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs font-mono text-[#2A1E17]"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                City
              </label>
              <input
                type="text"
                value={shippingConfig.shiprocketPickupCity || ""}
                onChange={(e) =>
                  setShippingConfig({
                    ...shippingConfig,
                    shiprocketPickupCity: e.target.value,
                  })
                }
                placeholder="Noida"
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                State
              </label>
              <input
                type="text"
                value={shippingConfig.shiprocketPickupState || ""}
                onChange={(e) =>
                  setShippingConfig({
                    ...shippingConfig,
                    shiprocketPickupState: e.target.value,
                  })
                }
                placeholder="Uttar Pradesh"
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
              />
            </div>
          </div>
        </div>

        {/* 2. Packaging & Volumetric Defaults */}
        <div className="pt-3 border-t border-stone-100">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#C86A28]" />
            <span>Eyewear Box Packaging Specification (For Courier Volumetric Weight)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Dead Weight (kg)
              </label>
              <input
                type="number"
                step="0.05"
                value={shippingConfig.defaultWeightKg || 0.35}
                onChange={(e) =>
                  setShippingConfig({
                    ...shippingConfig,
                    defaultWeightKg: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Length (cm)
              </label>
              <input
                type="number"
                value={shippingConfig.packageDimensions?.length || 18}
                onChange={(e) =>
                  setShippingConfig({
                    ...shippingConfig,
                    packageDimensions: {
                      ...shippingConfig.packageDimensions,
                      length: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Breadth (cm)
              </label>
              <input
                type="number"
                value={shippingConfig.packageDimensions?.breadth || 12}
                onChange={(e) =>
                  setShippingConfig({
                    ...shippingConfig,
                    packageDimensions: {
                      ...shippingConfig.packageDimensions,
                      breadth: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={shippingConfig.packageDimensions?.height || 8}
                onChange={(e) =>
                  setShippingConfig({
                    ...shippingConfig,
                    packageDimensions: {
                      ...shippingConfig.packageDimensions,
                      height: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs"
              />
            </div>
          </div>
        </div>

        {/* 3. Optical Lab Dispatch Policy Gate */}
        <div className="pt-3 border-t border-stone-100 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#C86A28]" />
            <span>Fulfillment Gate &amp; AWB Dispatch Workflow</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "manual_1click",
                title: "Manual 1-Click Dispatch",
                badge: "Recommended",
                desc: "Master optician inspects lenses and 1-click books courier & prints label in Order Details view.",
              },
              {
                id: "hybrid",
                title: "Hybrid Fulfillment",
                badge: "Intelligent",
                desc: "Auto-books sunglasses & accessories on payment; prescription glasses wait for Lab Quality Check.",
              },
              {
                id: "auto_dispatch",
                title: "Instant Auto-Booking",
                badge: "Fastest",
                desc: "Instantly creates Shiprocket consignment and assigns AWB upon payment capture.",
              },
            ].map((mode) => (
              <div
                key={mode.id}
                onClick={() =>
                  setShippingConfig({
                    ...shippingConfig,
                    fulfillmentMode: mode.id,
                  })
                }
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  shippingConfig.fulfillmentMode === mode.id
                    ? "border-[#C86A28] bg-[#FAF3EB] ring-1 ring-[#C86A28]"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#2A1E17]">{mode.title}</span>
                  <span className="text-[9px] bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded font-semibold uppercase">
                    {mode.badge}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Webhook Configuration Box */}
        <div className="pt-3 border-t border-stone-100 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DCCF] space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-[#2A1E17]">
              <Webhook className="w-4 h-4 text-[#C86A28]" />
              <span>Shiprocket Webhook Receiver</span>
            </div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider">
              Automatic Status Updates
            </span>
          </div>

          <p className="text-[11px] text-stone-600 leading-relaxed">
            Configure this URL in your Shiprocket Dashboard (<em>Settings &gt; API &gt; Webhooks &gt; Add Webhook</em>) to automatically sync tracking events.
          </p>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-stone-500 uppercase">Webhook URL (Keyword-compliant)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 bg-white border border-[#E8DCCF] px-3 py-1.5 rounded-lg font-mono text-[11px] text-stone-800"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopyWebhook}
                className="text-xs h-8 bg-white border-[#E8DCCF] text-[#2A1E17]"
              >
                {copiedWebhook ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    <span>Copy URL</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-[10px] text-amber-800 bg-amber-50/70 border border-amber-200/60 p-2 rounded-md">
              <strong>Shiprocket Constraint:</strong> Shiprocket prohibits keywords like <code>shiprocket</code>, <code>kartrocket</code>, <code>sr</code>, or <code>kr</code> in the webhook URL. This <code>/api/webhooks/delivery</code> endpoint complies with this requirement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Auth Token Type in Shiprocket</label>
              <input
                type="text"
                readOnly
                value="x-api-key"
                className="mt-1 w-full bg-white border border-[#E8DCCF] px-2.5 py-1 rounded-lg font-mono text-[11px] text-stone-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-500 uppercase">Token / Secret</label>
              <input
                type="text"
                readOnly
                value={shippingConfig.shiprocketWebhookSecret || "prec_shiprocket_sec_2026"}
                className="mt-1 w-full bg-white border border-[#E8DCCF] px-2.5 py-1 rounded-lg font-mono text-[11px] text-stone-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Free Shipping Rule Module */}
      <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#C86A28] mb-1">
            Storewide Incentive Policy
          </div>
          <h2 className="text-base font-bold text-[#2A1E17]">Complimentary Insured Transit</h2>
          <p className="text-xs text-stone-600 max-w-xl mt-1 leading-relaxed">
            Orders surpassing this value receive zero-cost priority armored transit with transit insurance coverage included.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Free Shipping Threshold (INR ₹)
            </label>
            <input
              type="number"
              value={shippingConfig.freeShippingThreshold}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  freeShippingThreshold: Number(e.target.value),
                })
              }
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Standard Courier Rate (Sub-threshold) (INR ₹)
            </label>
            <input
              type="number"
              value={shippingConfig.standardShippingFee}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  standardShippingFee: Number(e.target.value),
                })
              }
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Default Primary Air Courier
            </label>
            <input
              type="text"
              value={shippingConfig.defaultCarrier}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  defaultCarrier: e.target.value,
                })
              }
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>
        </div>
      </div>

      {/* White-Glove Concierge Home Trial */}
      <div className="bg-white border border-[#E8DCCF] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Luxury Atelier Service
            </div>
            <h2 className="text-base font-bold text-[#2A1E17]">
              White-Glove In-Home Frame Trial
            </h2>
            <p className="text-xs text-stone-600 max-w-xl mt-1 leading-relaxed">
              Optician hand-delivers a curated case of up to 5 designer frames directly to the client residence or executive suite with digital pupillometer.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <span className="text-stone-600">Active</span>
            <input
              type="checkbox"
              checked={shippingConfig.enableWhiteGloveHomeTrial}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  enableWhiteGloveHomeTrial: e.target.checked,
                })
              }
              className="rounded text-[#C86A28] w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Home Trial Security Hold Deposit (INR ₹)
            </label>
            <input
              type="number"
              value={shippingConfig.trialDepositAmount}
              onChange={(e) =>
                setShippingConfig({
                  ...shippingConfig,
                  trialDepositAmount: Number(e.target.value),
                })
              }
              className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DCCF] rounded-md text-xs text-[#2A1E17]"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Eligible Metro Clusters
            </label>
            <div className="text-stone-600 text-xs py-1.5">
              Delhi NCR, Mumbai South, Bengaluru Koramangala &amp; Indiranagar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
