import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const contacts = [
  { role: "Electrician", name: "—", phone: "—" },
  { role: "Mechanic", name: "—", phone: "—" },
  { role: "Machine repair", name: "—", phone: "—" },
  { role: "Transport company", name: "—", phone: "—" },
  { role: "Accountant", name: "—", phone: "—" },
  { role: "Lawyer", name: "—", phone: "—" },
  { role: "Cleaning company", name: "—", phone: "—" },
  { role: "Technical services", name: "—", phone: "—" },
];

export default function ContactsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
        <p className="mt-1 text-sm text-white/60">Emergency and maintenance contacts list.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {contacts.map((c) => (
          <Card key={c.role}>
            <CardHeader>
              <CardTitle>{c.role}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white/70">Name: {c.name}</div>
              <div className="mt-1 text-sm text-white/70">Phone: {c.phone}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
