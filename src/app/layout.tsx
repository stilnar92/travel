import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Building2, Tags } from "lucide-react";
import { tv } from "tailwind-variants";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { createServerSupabaseClient } from "@/shared/adapters/supabase/client";
import { routes } from "@/shared/lib/routes";
import { Stack } from "@/shared/ui/layout/stack";
import { Text } from "@/shared/ui/data-display/text";
import { LogoutButton } from "@/shared/ui/buttons/LogoutButton";
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
    sidebar: "w-64 border-r bg-sidebar p-4 flex flex-col",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NuqsAdapter>
          {user ? (
            <div className={root()}>
              <aside className={sidebar()}>
                <Stack gap="lg" className="h-full">
                  <Text as="h1" size="xl" weight="bold">
                    Vendor Management
                  </Text>
                  <nav className="flex-1">
                    <Stack gap="xs">
                      <Link href={routes.vendors.list} className={navLink()}>
                        <Building2 className="h-4 w-4" />
                        Vendors
                      </Link>
                      <Link href={routes.categories.list} className={navLink()}>
                        <Tags className="h-4 w-4" />
                        Categories
                      </Link>
                    </Stack>
                  </nav>
                  <LogoutButton />
                </Stack>
              </aside>
              <main className={main()}>{children}</main>
            </div>
          ) : (
            <main className="min-h-screen">{children}</main>
          )}
        </NuqsAdapter>
      </body>
    </html>
  );
}
