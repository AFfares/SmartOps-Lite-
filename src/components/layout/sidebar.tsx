"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";

import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Clock4,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListTodo,
  PlaneTakeoff,
  QrCode,
  ReceiptText,
  ScanLine,
  ShoppingCart,
  User,
  Wallet,
  Factory,
  Boxes,
  Users,
  Handshake,
  Truck,
  GraduationCap,
  Package,
  BarChart3,
  Brain,
  PhoneCall,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type SidebarItem = {
  href: string;
  label: string;
  icon: string;
  badge?: string;
};

type SidebarProps = {
  title: string;
  items: SidebarItem[];
  className?: string;
};

const iconMap: Record<string, ElementType<{ className?: string }>> = {
  dashboard: LayoutDashboard,

  // Customer portal
  orders: ReceiptText,
  payments: CreditCard,
  scan: ScanLine,
  profile: User,
  cart: ShoppingCart,
  qrcode: QrCode,

  tasks: ListTodo,
  attendance: Clock4,
  leave: PlaneTakeoff,
  reports: FileText,
  salary: Wallet,
  notifications: Bell,
  urgent: AlertTriangle,
  calendar: CalendarDays,

  factory: Factory,
  inventory: Boxes,
  users: Users,
  wallet: Wallet,
  crm: Handshake,
  truck: Truck,
  graduation: GraduationCap,
  package: Package,
  analytics: BarChart3,
  brain: Brain,
  phone: PhoneCall,
  settings: Settings,
};

export function Sidebar({
  title,
  items,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:w-72 lg:flex-col border-r border-slate-800/60 bg-slate-950/40 backdrop-blur",
        className
      )}
    >
      <div className="px-5 py-5">
        <div className="text-sm font-semibold tracking-tight text-slate-100">
          {title}
        </div>

        <div className="mt-1 text-xs text-slate-400">
          SmartOps Lite
        </div>
      </div>

      <nav className="flex-1 px-3 pb-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;

            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-200 ring-1 ring-indigo-500/20"
                      : "text-slate-200/80 hover:bg-slate-800/40 hover:text-slate-100"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive
                          ? "text-indigo-300"
                          : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />

                    <span>{item.label}</span>
                  </span>

                  {item.badge ? (
                    <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-200/80">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}