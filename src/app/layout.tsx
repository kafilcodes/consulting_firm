import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SKS Consulting - Professional Business Solutions",
  description: "Premium business consulting services for strategic growth and financial success",
  icons: {
    icon: "/images/logo/sks_logo.png",
  },
};

// Client-side script to clean up cookies if needed
const CookieCleanupScript = () => {
  return (
    <script dangerouslySetInnerHTML={{
      __html: `
        try {
          // Check for infinite redirect cookie
          if (document.cookie.includes('redirect_loop_protection')) {
            // Clear all auth cookies
            document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
            document.cookie = 'user-role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
            // Clear the protection cookie
            document.cookie = 'redirect_loop_protection=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
            console.log("Cleaned up cookies due to redirect loop detection");
          } else if (window.location.pathname === '/admin/dashboard') {
            // If trying to access /admin/dashboard, set protection cookie and redirect to /admin
            document.cookie = 'redirect_loop_protection=true; Path=/; Max-Age=60; SameSite=Strict';
            window.location.href = '/admin';
          }
        } catch (e) {
          console.error("Error in cookie cleanup script:", e);
        }
      `
    }} />
  );
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
        <CookieCleanupScript />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 