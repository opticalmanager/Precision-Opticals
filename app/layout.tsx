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
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FAF7F2] text-[#2A1E17] antialiased selection:bg-[#C86A28] selection:text-white min-h-screen">
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
