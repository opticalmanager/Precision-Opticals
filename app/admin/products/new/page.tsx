"use client";

import React, { useState, useEffect } from "react";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { Loader2 } from "lucide-react";

export default function NewProductPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/brands").then((r) => r.json()),
    ]).then(([catData, brandData]) => {
      if (catData.categories) setCategories(catData.categories);
      if (brandData.brands) setBrands(brandData.brands);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-[#C86A28] animate-spin" />
      </div>
    );
  }

  return <ProductForm categories={categories} brands={brands} isEdit={false} />;
}
