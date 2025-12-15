import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Building2, Tags } from "lucide-react";
import { tv } from "tailwind-variants";
import { Stack } from "@/shared/ui/layout/stack";
import { Text } from "@/shared/ui/data-display/text";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vendor Management",
  description: "Manage vendors and categories",
};

const layout = tv({
  slots: {
    root: "flex min-h-screen",
    sidebar: "w-64 border-r bg-sidebar p-4",
    main: "flex-1 p-6",
  },
});

const navLink = tv({
  base: [
    "flex items-center gap-2 rounded-md px-3 py-2",
    "text-sm font-medium",
    "hover:bg-sidebar-accent",
    "transition-colors",
  ],
});

const { root, sidebar, main } = layout();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className={root()}>
          <aside className={sidebar()}>
            <Stack gap="lg">
              <Text as="h1" size="xl" weight="bold">
                Vendor Management
              </Text>
              <nav>
                <Stack gap="xs">
                  <Link href="/vendors" className={navLink()}>
                    <Building2 className="h-4 w-4" />
                    Vendors
                  </Link>
                  <Link href="/categories" className={navLink()}>
                    <Tags className="h-4 w-4" />
                    Categories
                  </Link>
                </Stack>
              </nav>
            </Stack>
          </aside>
          <main className={main()}>{children}</main>
        </div>
      </body>
    </html>
  );
}
