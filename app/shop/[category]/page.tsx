import { redirect } from "next/navigation";

export default async function ShopCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  redirect(`/shop?category=${encodeURIComponent(category || "")}`);
}
