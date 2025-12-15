"use client";

import { LogOut } from "lucide-react";
import { Button } from "./button";
import { signOutAction } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <Button variant="ghost" className="w-full justify-start gap-2">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </form>
  );
}
