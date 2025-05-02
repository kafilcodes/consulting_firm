import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SKS Consulting - Professional Business Solutions",
  description: "Premium business consulting services for strategic growth and financial success",
  icons: {
    icon: "/images/logo/sks_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo/sks_logo.png" sizes="any" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="pt-16">
            {children}
          </div>
          <Toaster richColors closeButton />
        </Providers>
      </body>
    </html>
  );
} 