"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/admin/common/EmptyState";

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/admin/products/${id}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/brands").then((r) => r.json()),
    ]).then(([prodData, catData, brandData]) => {
      if (prodData.product) setProduct(prodData.product);
      if (catData.categories) setCategories(catData.categories);
      if (brandData.brands) setBrands(brandData.brands);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-[#C86A28] animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyState
        title="Product Not Found"
        description="The requested eyewear product could not be located in the catalog database."
        actionLabel="Back to Catalog"
        onAction={() => window.history.back()}
      />
    );
  }

  return (
    <ProductForm
      initialData={product}
      categories={categories}
      brands={brands}
      isEdit={true}
    />
  );
}
