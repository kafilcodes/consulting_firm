import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "SKS Consulting",
  description: "Professional consulting services for all your business needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="pt-16">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
} 