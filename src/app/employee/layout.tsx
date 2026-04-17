import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { authOptions } from "@/lib/auth";

const employeeItems = [
  { href: "/employee/dashboard", label: "My Dashboard", icon: "dashboard" },
  { href: "/employee/tasks", label: "Tasks", icon: "tasks" },
  { href: "/employee/attendance", label: "Attendance", icon: "attendance" },
  { href: "/employee/leave", label: "Leave Requests", icon: "leave" },
  { href: "/employee/reports", label: "Reports", icon: "reports" },
  { href: "/employee/salary", label: "Salary", icon: "salary" },
  { href: "/employee/notifications", label: "Notifications", icon: "notifications" },
  { href: "/employee/urgent", label: "Urgent", icon: "urgent" },
  { href: "/employee/calendar", label: "Calendar", icon: "calendar" },
];

type EmployeeLayoutProps = {
  children: React.ReactNode;
};

export default async function EmployeeLayout({
  children,
}: EmployeeLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "EMPLOYEE") {
    redirect("/");
  }

  if (!session.user.organizationId) {
    redirect("/sign-in?pending=1");
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar title="Employee Portal" items={employeeItems} />

      <div className="flex-1 flex flex-col">
        <Topbar title="Employee Portal" />

        <main className="flex-1 p-5">
          {children}
        </main>
      </div>
    </div>
  );
}