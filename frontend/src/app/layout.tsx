import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Traffic Violation System",
    template: "%s | Traffic Violation System",
  },
  description:
    "Manage traffic violations efficiently and transparently. A comprehensive system for citizens, officers, and administrators.",
  keywords: [
    "traffic violations",
    "traffic management",
    "violation records",
    "traffic fines",
    "law enforcement",
  ],
  authors: [{ name: "Traffic Violation System Team" }],
  creator: "Traffic Violation System",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://traffic-violation-system.com",
    siteName: "Traffic Violation System",
    title: "Traffic Violation System",
    description:
      "Manage traffic violations efficiently and transparently. A comprehensive system for citizens, officers, and administrators.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
