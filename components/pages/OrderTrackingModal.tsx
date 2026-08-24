import React, { useState } from 'react';
import { X, Search, CheckCircle2, Truck, Package, Clock, ShieldCheck, MapPin, Glasses } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';

export const OrderTrackingModal: React.FC = () => {
  const { isTrackingModalOpen, closeTrackingModal, selectedTrackingOrder, orders } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(selectedTrackingOrder || (orders.length > 0 ? orders[0] : null));

  if (!isTrackingModalOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    const found = orders.find((o) => o.trackingNumber.toUpperCase() === query || o.id.toUpperCase() === query);
    if (found) {
      setActiveOrder(found);
    } else {
      alert(`No order found matching "${query}". Please check your order reference.`);
    }
  };

  const currentDisplayOrder = activeOrder || selectedTrackingOrder || (orders.length > 0 ? orders[0] : null);

  const STAGES = [
    { id: 'confirmed', title: 'Order Confirmed & Rx Verified', desc: 'Prescription parameters checked by master optician' },
    { id: 'optician_assembly', title: 'Robotic Lens Surfacing', desc: 'Precision surfacing & anti-reflective hard-coating' },
    { id: 'quality_check', title: '12-Point Clinical Inspection', desc: 'Zero-error optical alignment and tension test' },
    { id: 'dispatched', title: 'Insured Courier Dispatched', desc: 'Packed in shock-proof luxury vault box' },
    { id: 'delivered', title: 'Delivered to Doorstep', desc: 'Complete with certificate of authenticity & warranty' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] border border-[#E8DCCF] max-w-2xl w-full my-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#2A1E17] text-white px-6 py-4 flex items-center justify-between border-b border-orange-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-[#E59B62]" />
            <div>
              <h3 className="font-serif text-sm tracking-widest uppercase font-bold text-[#E59B62]">
                PRECISION OPTICAL ORDER TRACKER
              </h3>
              <p className="text-[10px] text-stone-300 font-sans tracking-wider uppercase">
                Real-Time Clinical Assembly & Delivery Status
              </p>
            </div>
          </div>
          <button onClick={closeTrackingModal} className="p-1 hover:text-[#E59B62] text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans text-stone-800">
          {/* Tracking Search Input */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Order ID (e.g. PO-892341)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-white border border-stone-300 px-3 py-2 text-xs rounded-lg uppercase focus:outline-none focus:border-[#C85A1B]"
            />
            <button
              type="submit"
              className="bg-[#2A1E17] text-white px-4 py-2 font-serif font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#C85A1B] cursor-pointer"
            >
              Search
            </button>
          </form>

          {currentDisplayOrder ? (
            <div className="space-y-6">
              {/* Order Info Card */}
              <div className="bg-white p-4 border border-[#E8DCCF] rounded-xl flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Tracking Reference</span>
                  <span className="font-mono font-bold text-base text-[#1C1917]">{currentDisplayOrder.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Estimated Delivery</span>
                  <span className="font-bold text-xs text-emerald-700">{currentDisplayOrder.estimatedDeliveryDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Amount</span>
                  <span className="font-serif font-bold text-sm text-[#C85A1B]">{formatINR(currentDisplayOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="bg-white p-6 border border-[#E8DCCF] rounded-xl space-y-6">
                <h4 className="font-serif font-bold uppercase text-xs text-stone-900 border-b border-stone-100 pb-2">
                  Atelier Production Pipeline
                </h4>

                <div className="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {STAGES.map((st, idx) => {
                    const isPassed = idx <= 1; // Simulated progress
                    return (
                      <div key={st.id} className="relative flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full absolute -left-6 flex items-center justify-center text-white ${
                            isPassed ? 'bg-[#C85A1B]' : 'bg-stone-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className={`font-bold text-xs uppercase ${isPassed ? 'text-stone-900' : 'text-stone-400'}`}>
                            {st.title}
                          </h5>
                          <p className="text-[11px] text-stone-500 mt-0.5">{st.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in Order */}
              <div className="bg-white p-4 border border-[#E8DCCF] rounded-xl space-y-3">
                <span className="font-bold uppercase text-stone-900 text-xs block">
                  Frames in This Shipment ({currentDisplayOrder.items.length})
                </span>
                <div className="space-y-2">
                  {currentDisplayOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-[#FAF7F2] border border-stone-200">
                      <div className="flex items-center gap-2.5">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 object-contain bg-white border p-0.5" />
                        <div>
                          <span className="font-bold block text-xs">{item.product.name}</span>
                          <span className="text-[10px] text-stone-500">
                            {item.lensConfig ? item.lensConfig.lensPackage?.name || 'Custom Rx' : 'Frame Only'}
                          </span>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-xs">{formatINR(item.product.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-white p-6 border border-[#E8DCCF] rounded-xl space-y-2">
              <p className="font-bold text-xs text-stone-700">No active tracking order selected.</p>
              <p className="text-[11px] text-stone-500">Enter your order ID above or complete a purchase to track your frames.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
