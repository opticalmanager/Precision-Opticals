import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit3, Trash2, Eye, CheckSquare, Square, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "../common/StatusBadge";

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  gender: string;
  shape: string;
  base_price: number | string;
  original_price?: number | string;
  is_active: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  created_at: string;
  brand_name?: string;
  category_name?: string;
  category_slug?: string;
  images?: { url: string; is_primary?: boolean }[];
  variants?: { sku: string; stock_quantity: number }[];
  total_stock?: number;
}

interface ProductTableProps {
  products: ProductRow[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDeleteClick: (id: string, name: string) => void;
  onToggleStatus?: (id: string, newStatus: boolean) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteClick,
  onToggleStatus,
}) => {
  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.includes(p.id));
  const someSelected =
    products.some((p) => selectedIds.includes(p.id)) && !allSelected;

  return (
    <div className="bg-white border border-[#E8DCCF] rounded-xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-[#FAF7F2] text-[11px] font-semibold text-stone-500 uppercase tracking-wider select-none">
              <th className="py-3 px-4 w-10">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  aria-label="Select all"
                  className="text-stone-400 hover:text-[#2A1E17] flex items-center cursor-pointer"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#C86A28]" />
                  ) : someSelected ? (
                    <Square className="w-4 h-4 text-[#C86A28] fill-[#C86A28]/20" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-3">Product Name</th>
              <th className="py-3 px-3">SKU & Date</th>
              <th className="py-3 px-3">Category & Brand</th>
              <th className="py-3 px-3">Price</th>
              <th className="py-3 px-3">Stock</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              const primaryImage =
                p.images && p.images.length > 0
                  ? p.images[0].url
                  : "/images/placeholder.jpg";
              const primarySku =
                p.variants && p.variants.length > 0 ? p.variants[0].sku : "N/A";
              const stock = Number(p.total_stock ?? 0);

              let statusLabel = p.is_active ? "published" : "draft";
              if (stock === 0) statusLabel = "out_of_stock";

              return (
                <tr
                  key={p.id}
                  className={`hover:bg-[#FAF7F2]/80 transition-colors group ${
                    isSelected ? "bg-orange-50/30" : ""
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="py-2.5 px-4">
                    <button
                      type="button"
                      onClick={() => onToggleSelect(p.id)}
                      aria-label="Select row"
                      className="text-stone-400 hover:text-[#2A1E17] flex items-center cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#C86A28]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  {/* Product Name + Thumbnail */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                        <img
                          src={primaryImage}
                          alt={p.name}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0 max-w-[240px]">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-bold text-[#2A1E17] hover:text-[#C86A28] hover:underline truncate block"
                        >
                          {p.name}
                        </Link>
                        <div className="text-[11px] text-stone-500 truncate">
                          {p.subtitle || p.shape}
                        </div>
                        {p.is_new_arrival && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-[#C86A28] border border-amber-200/80 px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                            New Arrival
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU & Date */}
                  <td className="py-2.5 px-3">
                    <div className="font-mono text-[11px] font-semibold text-stone-700">
                      {primarySku}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {new Date(p.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </td>

                  {/* Category & Brand */}
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-stone-800">
                      {p.brand_name || "Precision"}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {p.category_name || "Eyewear"}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-[#2A1E17]">
                      {formatCurrency(Number(p.base_price))}
                    </div>
                    {p.original_price && Number(p.original_price) > Number(p.base_price) && (
                      <div className="text-[10px] text-stone-400 line-through">
                        {formatCurrency(Number(p.original_price))}
                      </div>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-semibold ${
                          stock === 0
                            ? "text-rose-600"
                            : stock <= 5
                            ? "text-amber-600"
                            : "text-stone-800"
                        }`}
                      >
                        {stock.toLocaleString()}
                      </span>
                      {stock <= 5 && stock > 0 && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                          Low
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Badge (Reference 2 style) */}
                  <td className="py-2.5 px-3">
                    {onToggleStatus ? (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(p.id, !p.is_active)}
                        title={`Click to switch to ${p.is_active ? "Draft" : "Published"}`}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <StatusBadge status={statusLabel} size="sm" />
                      </button>
                    ) : (
                      <StatusBadge status={statusLabel} size="sm" />
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        aria-label="Edit product"
                        className="p-1 rounded text-stone-500 hover:text-[#2A1E17] hover:bg-stone-100 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDeleteClick(p.id, p.name)}
                        aria-label="Delete product"
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
