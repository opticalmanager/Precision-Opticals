import React from 'react';
import { CheckCircle2, X, Package, Calendar, MapPin, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8DCCF] max-w-xl w-full my-8 p-6 sm:p-8 shadow-2xl relative text-stone-800 text-xs font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-stone-400 hover:text-black cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon & Header */}
        <div className="text-center space-y-2 pb-6 border-b border-stone-200">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold text-[#C85A1B] uppercase tracking-widest block">
            ESTD. 1969 • PRECISION OPTICS
          </span>
          <h2 className="font-serif text-2xl font-bold uppercase text-[#1C1917]">
            Order Confirmed & Received!
          </h2>
          <p className="text-stone-600 max-w-sm mx-auto leading-relaxed">
            Thank you for your patronage. Your bespoke optical order has been routed to our certified opticians for custom assembly and quality check.
          </p>
        </div>

        {/* Order Details Receipt Card */}
        <div className="py-5 space-y-4">
          <div className="bg-[#FAF7F2] p-4 border border-[#E8DCCF] rounded-lg grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Order Number</span>
              <span className="font-mono font-bold text-sm text-[#1C1917]">{order.trackingNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Estimated Delivery</span>
              <span className="font-bold text-sm text-emerald-700">{order.estimatedDeliveryDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Payment Method</span>
              <span className="font-bold uppercase">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Total Paid</span>
              <span className="font-serif font-bold text-sm text-[#C85A1B]">{formatINR(order.totalAmount)}</span>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="space-y-2">
            <span className="font-serif font-bold text-xs uppercase text-stone-900 block">
              Items in Order ({order.items.length})
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-2 truncate">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-8 h-8 object-contain bg-white border" />
                    <div className="truncate">
                      <span className="font-bold block truncate">{item.product.name}</span>
                      <span className="text-[10px] text-stone-500">
                        {item.lensConfig ? item.lensConfig.lensPackage?.name || 'Custom Lens' : 'Frame Only'} x {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-serif font-bold shrink-0 ml-2">
                    {formatINR((item.product.price + (item.lensConfig?.totalLensPrice || 0)) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order);
            }}
            className="bg-stone-100 hover:bg-stone-200 text-stone-900 py-3 font-serif font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-[#C85A1B]" />
            <span>Track Order</span>
          </button>

          <button
            onClick={onClose}
            className="bg-[#2A1E17] hover:bg-[#C85A1B] text-white py-3 font-serif font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
