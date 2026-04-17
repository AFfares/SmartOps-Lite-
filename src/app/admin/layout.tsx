import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { authOptions } from "@/lib/auth";

const adminItems = [
  { href: "/admin/overview", label: "Overview", icon: "dashboard" },
  { href: "/admin/production", label: "Production", icon: "factory" },
  { href: "/admin/inventory", label: "Inventory", icon: "inventory" },
  { href: "/admin/employees", label: "Employees", icon: "users" },
  { href: "/admin/finance", label: "Finance", icon: "wallet" },
  { href: "/admin/crm", label: "CRM", icon: "crm" },
  { href: "/admin/suppliers", label: "Suppliers", icon: "truck" },
  { href: "/admin/internships", label: "Internships", icon: "graduation" },
  { href: "/admin/catalog", label: "Product Catalog", icon: "package" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
  { href: "/admin/ai", label: "AI Assistant", icon: "brain" },
  { href: "/admin/contacts", label: "Contacts", icon: "phone" },
  { href: "/admin/urgent", label: "Urgent Notifications", icon: "urgent" },
  { href: "/admin/calendar", label: "Calendar", icon: "calendar" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "COMPANY_ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar title="Company Admin" items={adminItems} />

      <div className="flex-1 flex flex-col">
        <Topbar title="Company Dashboard" />

        <main className="flex-1 p-5">
          {children}
        </main>
      </div>
    </div>
  );
}