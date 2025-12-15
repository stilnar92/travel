import Link from "next/link";
import { Building2, Tags, LogOut } from "lucide-react";
import { tv } from "tailwind-variants";
import { routes } from "@/shared/lib/routes";
import { signOutAction } from "@/shared/features/auth";
import { Stack } from "@/shared/ui/layout/stack";
import { Text } from "@/shared/ui/data-display/text";
import { Button } from "@/shared/ui/buttons/button";

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

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
          <form action={signOutAction}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </Stack>
      </aside>
      <main className={main()}>{children}</main>
    </div>
  );
}
