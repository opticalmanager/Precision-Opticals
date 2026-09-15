import type { Metadata } from "next";
import { AdminLayoutShell } from "@/components/admin/layout/AdminLayoutShell";

export const metadata: Metadata = {
  title: "Admin Panel | Precision Optics",
  description: "Enterprise administration operating system for Precision Optics luxury eyewear.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
