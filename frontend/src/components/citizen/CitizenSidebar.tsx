"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  History,
  MessageSquare,
  CreditCard,
  Car,
  UserCircle,
  Bell,
  Settings
} from "lucide-react";

const mainLinks = [
  { href: "/citizen/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/citizen/violations", label: "Violations", icon: History },
  { href: "/citizen/complaints", label: "Complaints", icon: MessageSquare },
  { href: "/citizen/payments", label: "Payments", icon: CreditCard },
  { href: "/citizen/vehicles", label: "Vehicles", icon: Car },
];

const secondaryLinks = [
  { href: "/citizen/notifications", label: "Notifications", icon: Bell },
  { href: "/citizen/profile", label: "Profile", icon: UserCircle },
  { href: "/citizen/settings", label: "Settings", icon: Settings },
];

export function CitizenSidebar() {
  const pathname = usePathname();

  const renderLinks = (links: typeof mainLinks) => {
    return links.map((link) => {
      const Icon = link.icon;
      const isActive = pathname === link.href || pathname.startsWith(link.href);

      return (
        <Link
          key={link.href}
          href={link.href}
          className={clsx(
            "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 group",
            isActive
              ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1",
          )}
        >
          <Icon className={clsx(
            "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
          )} />
          <span>{link.label}</span>
          {isActive && (
            <div className="ml-auto flex items-center">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
            </div>
          )}
        </Link>
      );
    });
  };

  return (
    <nav className="p-6 h-full flex flex-col">
      <div className="mb-8 px-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Portal Services</h2>
      </div>

      <div className="space-y-2 flex-grow">
        {renderLinks(mainLinks)}
      </div>

      <div className="mt-auto space-y-6">
        <div className="border-t border-border/50 pt-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-4 px-2">Account</h2>
          <div className="space-y-2">
            {renderLinks(secondaryLinks)}
          </div>
        </div>
      </div>
    </nav>
  );
}
