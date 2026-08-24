import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Precision Optics (Estd. 1969) | Luxury Eyewear & Clinical Optometry",
  description:
    "Authorized luxury eyewear boutique & clinical eye care institution. Official retailer for Cartier, Tom Ford, GAST, Ray-Ban Meta, Lindberg Titanium, and Zeiss progressive lenses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,300;0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700;0,6..12,800;1,6..12,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F4ECE1] text-[#332219] antialiased selection:bg-[#C85A1B] selection:text-white min-h-screen">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <Toaster position="bottom-right" richColors />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
