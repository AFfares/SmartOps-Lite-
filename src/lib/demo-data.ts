export type DemoOrganization = {
  id: string;
  name: string;
  slug: string;
};

export type DemoProduct = {
  id: string;
  organization: DemoOrganization;
  name: string;
  description: string;
  priceDzd: number;
  rating: number;
  image: string;
  category: string;
};

export type DemoOrder = {
  id: string;
  organization: DemoOrganization;
  status: string;
  totalDzd: number;
  createdAt: string; // ISO
  itemsCount: number;
};

export type DemoTask = {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueAt: string | null; // ISO
};

export type DemoCalendarEvent = {
  id: string;
  title: string;
  description: string;
  startAt: string; // ISO
  endAt: string; // ISO
  location: string | null;
};

export const demoOrganizations: DemoOrganization[] = [
  { id: "org_demo_smartops", name: "SmartOps Lite", slug: "smartops-lite" },
  { id: "org_demo_2mp", name: "2MP Industry", slug: "2mp-industry" },
  { id: "org_demo_atlas", name: "Atlas Manufacturing", slug: "atlas-manufacturing" },
];

export const demoProducts: DemoProduct[] = [
  {
    id: "demo_p_cnc",
    organization: demoOrganizations[0],
    name: "CNC MiniCut",
    description: "Compact CNC for workshops and training labs.",
    priceDzd: 980000,
    rating: 4.6,
    image: "/demo/products/cnc-minicut.jpg",
    category: "CNC Machines",
  },
  {
    id: "demo_p_3d",
    organization: demoOrganizations[0],
    name: "3D Printer Pro X1",
    description: "Industrial-grade 3D printer for rapid prototyping.",
    priceDzd: 1250000,
    rating: 4.4,
    image: "/demo/products/3d-printer-pro-x1.jpg",
    category: "3D Printers",
  },
  {
    id: "demo_p_plc",
    organization: demoOrganizations[1],
    name: "PLC Control Module P-24",
    description: "PLC module for small automation projects.",
    priceDzd: 120000,
    rating: 4.2,
    image: "/demo/products/plc-control-module-p24.jpg",
    category: "Electronics",
  },
  {
    id: "demo_p_router",
    organization: demoOrganizations[0],
    name: "Smart Router NetCore",
    description: "Secure router for factory-floor IoT.",
    priceDzd: 68000,
    rating: 4.5,
    image: "/demo/products/smart-router-netcore.jpg",
    category: "Robotics",
  },
  {
    id: "demo_p_sensor",
    organization: demoOrganizations[2],
    name: "Sensor Pack SP-10",
    description: "Industrial sensors pack for automation setups.",
    priceDzd: 28000,
    rating: 4.3,
    image: "/demo/products/sensor-pack-sp10.jpg",
    category: "Industrial Tools",
  },
  {
    id: "demo_p_safety",
    organization: demoOrganizations[1],
    name: "Safety Helmet Smart",
    description: "Workplace protection with quick-inspection checklist.",
    priceDzd: 8900,
    rating: 4.1,
    image: "/demo/products/safety-helmet.jpg",
    category: "Safety Equipment",
  },
];

export const demoOrders: DemoOrder[] = [
  {
    id: "demo_o_1001",
    organization: demoOrganizations[0],
    status: "PENDING",
    totalDzd: 1116000,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    itemsCount: 3,
  },
  {
    id: "demo_o_1002",
    organization: demoOrganizations[1],
    status: "CONFIRMED",
    totalDzd: 515000,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    itemsCount: 2,
  },
  {
    id: "demo_o_1003",
    organization: demoOrganizations[2],
    status: "SHIPPED",
    totalDzd: 2400000,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    itemsCount: 1,
  },
];

export const demoTasks: DemoTask[] = [
  {
    id: "demo_t_1",
    title: "Safety check: CNC area",
    description: "Verify guards, emergency stop, and ventilation before starting shift.",
    status: "TODO",
    priority: "HIGH",
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo_t_2",
    title: "Update production log",
    description: "Record output quantities and any downtime causes.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    dueAt: null,
  },
  {
    id: "demo_t_3",
    title: "Reconcile stock movements",
    description: "Check today’s incoming/outgoing items in Warehouse A.",
    status: "DONE",
    priority: "LOW",
    dueAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const demoCalendarEvents: DemoCalendarEvent[] = [
  {
    id: "demo_e_1",
    title: "Production planning",
    description: "Weekly planning and bottleneck review.",
    startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    location: "HQ meeting room",
  },
  {
    id: "demo_e_2",
    title: "Preventive maintenance",
    description: "Maintenance window for critical equipment.",
    startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    location: "Workshop floor",
  },
  {
    id: "demo_e_3",
    title: "Supplier follow-up",
    description: "Call supplier about delivery schedule.",
    startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    location: null,
  },
];
