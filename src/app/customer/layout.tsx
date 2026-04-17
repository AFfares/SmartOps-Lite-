import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Sidebar } from "@/components/layout/sidebar";
import { CustomerTopbar } from "@/components/layout/customer-topbar";
import { authOptions } from "@/lib/auth";

const customerItems = [
  { href: "/customer/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/customer/orders", label: "My Orders", icon: "orders" },
  { href: "/customer/scan", label: "Scan QR", icon: "scan" },
  { href: "/customer/profile", label: "Profile", icon: "profile" },
];

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "CUSTOMER") redirect("/");

  return (
    <div className="min-h-screen flex">
      <Sidebar title="Customer Portal" items={customerItems} />
      <div className="flex-1 flex flex-col">
        <CustomerTopbar title="Customer Store" customerName={session.user.name ?? null} />
        <main className="flex-1 p-5">{children}</main>
      </div>
    </div>
  );
}
