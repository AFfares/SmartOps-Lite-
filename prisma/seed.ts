import {
  PrismaClient,
  Role,
  ProductStatus,
  OrderStatus,
  PaymentMethod,
  InventoryType,
  ProductionStatus,
  ProductionIssueType,
  Urgency,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const DEMO_PASSWORD = "Admin123!";
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // Clean re-seed (delete children first to satisfy FK constraints)
  await prisma.$transaction([
    prisma.aiMessage.deleteMany(),
    prisma.aiConversation.deleteMany(),

    prisma.notification.deleteMany(),
    prisma.calendarEvent.deleteMany(),

    prisma.employeeReport.deleteMany(),
    prisma.leaveRequest.deleteMany(),
    prisma.attendanceLog.deleteMany(),
    prisma.payroll.deleteMany(),
    prisma.employeeTask.deleteMany(),

    prisma.supplierInvoice.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.expense.deleteMany(),

    prisma.productionIssue.deleteMany(),
    prisma.productionOrder.deleteMany(),

    prisma.stockMovement.deleteMany(),
    prisma.inventoryItem.deleteMany(),

    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),

    prisma.product.deleteMany(),
    prisma.category.deleteMany(),

    prisma.joinRequest.deleteMany(),
    prisma.internshipApplication.deleteMany(),

    prisma.lead.deleteMany(),
    prisma.crmClient.deleteMany(),
    prisma.supplier.deleteMany(),

    prisma.customerProfile.deleteMany(),
    prisma.employeeProfile.deleteMany(),

    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.verificationToken.deleteMany(),

    prisma.user.deleteMany(),
    prisma.organization.deleteMany(),
  ]);

  // ---------------------------------------------------------------------
  // Organization
  // ---------------------------------------------------------------------
  const organization = await prisma.organization.create({
    data: {
      name: "SmartOps Lite",
      slug: "smartops-lite",
      joinCode: "DZ-SMARTOPS-2026",
    },
  });

  // ---------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------
  const admin = await prisma.user.create({
    data: {
      email: "admin@smartops-lite.com",
      name: "Amine Benali",
      passwordHash,
      role: Role.COMPANY_ADMIN,
      organizationId: organization.id,
    },
  });

  const employee = await prisma.user.create({
    data: {
      email: "employee1@smartops-lite.com",
      name: "Lamia Kaci",
      passwordHash,
      role: Role.EMPLOYEE,
      organizationId: organization.id,
      employeeProfile: {
        create: {
          department: "Production",
          jobTitle: "Production Supervisor",
        },
      },
    },
  });

  const employeeAhmed = await prisma.user.create({
    data: {
      email: "employee2@smartops-lite.com",
      name: "Ahmed Bensaïd",
      passwordHash,
      role: Role.EMPLOYEE,
      organizationId: organization.id,
      employeeProfile: {
        create: {
          department: "Maintenance",
          jobTitle: "Technicien maintenance",
        },
      },
    },
  });

  const employeeYacine = await prisma.user.create({
    data: {
      email: "employee3@smartops-lite.com",
      name: "Yacine Meziani",
      passwordHash,
      role: Role.EMPLOYEE,
      organizationId: organization.id,
      employeeProfile: {
        create: {
          department: "Logistics",
          jobTitle: "Magasinier",
        },
      },
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer1@smartops-lite.com",
      name: "Sarl El Bahdja Trading",
      passwordHash,
      role: Role.CUSTOMER,
      organizationId: organization.id,
      customerProfile: {
        create: {
          phone: "+213 555 12 34 56",
          address: "Rue Didouche Mourad, Alger",
        },
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "customer2@smartops-lite.com",
      name: "EURL Sahara Plast",
      passwordHash,
      role: Role.CUSTOMER,
      organizationId: organization.id,
      customerProfile: {
        create: {
          phone: "+213 770 22 33 44",
          address: "Zone industrielle, Blida",
        },
      },
    },
  });

  const pendingEmployeeUser = await prisma.user.create({
    data: {
      email: "employee.candidate@smartops-lite.com",
      name: "Salim Djouadi",
      passwordHash,
      role: Role.EMPLOYEE,
    },
  });

  await prisma.joinRequest.create({
    data: {
      organizationId: organization.id,
      userId: pendingEmployeeUser.id,
    },
  });

  // ---------------------------------------------------------------------
  // Catalog (Category + Products)
  // ---------------------------------------------------------------------
  const category = await prisma.category.create({
    data: {
      organizationId: organization.id,
      name: "Électricité Industrielle",
      slug: "electricite-industrielle",
    },
  });

  const category3d = await prisma.category.create({
    data: {
      organizationId: organization.id,
      name: "3D Printing",
      slug: "3d-printing",
    },
  });

  const products = await Promise.all([
    prisma.product.create({
      data: {
        organizationId: organization.id,
        categoryId: category.id,
        name: "Variateur de vitesse 7.5kW (VFD)",
        description: "Variateur industriel pour moteurs triphasés 380V. Idéal pour convoyeurs et pompes.",
        priceDzd: 68900,
        quantity: 18,
        status: ProductStatus.PUBLISHED,
        images: [],
        specs: { powerKw: 7.5, input: "380V", brand: "INVT", warrantyMonths: 12 },
        qrCodeData: "smartops-lite:product:vfd-7.5kw",
      },
    }),
    prisma.product.create({
      data: {
        organizationId: organization.id,
        categoryId: category.id,
        name: "Disjoncteur 3P 63A (Courbe C)",
        description: "Protection triphasée pour tableaux industriels. Montage rail DIN.",
        priceDzd: 7500,
        quantity: 60,
        status: ProductStatus.PUBLISHED,
        images: [],
        specs: { poles: 3, ratedCurrentA: 63, curve: "C" },
        qrCodeData: "smartops-lite:product:breaker-3p-63a",
      },
    }),
    prisma.product.create({
      data: {
        organizationId: organization.id,
        categoryId: category.id,
        name: "Capteur de proximité inductif M18",
        description: "Capteur industriel M18, 6mm, sortie PNP NO, IP67.",
        priceDzd: 3200,
        quantity: 120,
        status: ProductStatus.PUBLISHED,
        images: [],
        specs: { type: "inductive", size: "M18", rangeMm: 6, output: "PNP NO", ip: "IP67" },
        qrCodeData: "smartops-lite:product:prox-m18",
      },
    }),
    prisma.product.create({
      data: {
        organizationId: organization.id,
        categoryId: category.id,
        name: "Contacteur 32A bobine 220V",
        description: "Contacteur triphasé 32A, bobine 220VAC. Pour moteurs et charges.",
        priceDzd: 8900,
        quantity: 45,
        status: ProductStatus.PUBLISHED,
        images: [],
        specs: { ratedCurrentA: 32, coil: "220VAC", poles: 3 },
        qrCodeData: "smartops-lite:product:contactor-32a",
      },
    }),

    // 3D product (uses existing demo media under /public/demo)
    prisma.product.create({
      data: {
        organizationId: organization.id,
        categoryId: category3d.id,
        name: "Buse imprimante 3D (kit MK8/MK10)",
        description: "Kit buses (0.4mm/0.6mm) pour imprimantes 3D. Maintenance rapide + qualité d'extrusion.",
        priceDzd: 1900,
        quantity: 75,
        status: ProductStatus.PUBLISHED,
        images: ["/we/p.jpg"],
        tutorialVideoUrl: "/we/v.mp4",
        specs: { type: "nozzle-kit", sizesMm: [0.4, 0.6], material: "Brass", compatible: ["MK8", "MK10"] },
        qrCodeData: "smartops-lite:product:3d-nozzle-kit",
      },
    }),

    prisma.product.create({
      data: {
        organizationId: organization.id,
        categoryId: category3d.id,
        name: "Filament PLA 1kg (1.75mm)",
        description: "Filament PLA pour prototypage rapide. Bobine 1kg, diamètre 1.75mm.",
        priceDzd: 5200,
        quantity: 34,
        status: ProductStatus.PUBLISHED,
        images: [],
        specs: { material: "PLA", diameterMm: 1.75, weightKg: 1, colors: ["noir", "blanc", "gris"] },
        qrCodeData: "smartops-lite:product:pla-1kg",
      },
    }),

    prisma.product.create({
      data: {
        organizationId: organization.id,
        categoryId: category.id,
        name: "Relais thermique 9-13A",
        description: "Protection moteur, réglable 9-13A. Compatible contacteurs standards.",
        priceDzd: 5600,
        quantity: 28,
        status: ProductStatus.PUBLISHED,
        images: [],
        specs: { rangeA: "9-13", reset: "manual/auto" },
        qrCodeData: "smartops-lite:product:thermal-9-13",
      },
    }),

    prisma.product.create({
      data: {
        organizationId: organization.id,
        categoryId: category.id,
        name: "Alimentation 24V 10A (DIN)",
        description: "Alimentation 24VDC 10A, montage rail DIN. Pour capteurs/automatisme.",
        priceDzd: 11500,
        quantity: 20,
        status: ProductStatus.PUBLISHED,
        images: [],
        specs: { output: "24VDC", currentA: 10, mounting: "DIN" },
        qrCodeData: "smartops-lite:product:psu-24v-10a",
      },
    }),

    prisma.product.create({
      data: {
        organizationId: organization.id,
        categoryId: category.id,
        name: "Bouton arrêt d'urgence 22mm",
        description: "Arrêt d'urgence champignon 22mm, contact NC. Sécurité machine.",
        priceDzd: 1800,
        quantity: 95,
        status: ProductStatus.PUBLISHED,
        images: [],
        specs: { sizeMm: 22, contact: "NC", type: "mushroom" },
        qrCodeData: "smartops-lite:product:e-stop-22mm",
      },
    }),
  ]);

  // ---------------------------------------------------------------------
  // Orders (2 orders linked to customer + products)
  // ---------------------------------------------------------------------
  const order1Items = [
    { product: products[0], quantity: 1 },
    { product: products[1], quantity: 4 },
  ];

  const order1Total = order1Items.reduce((sum, item) => sum + item.product.priceDzd * item.quantity, 0);

  const order1 = await prisma.order.create({
    data: {
      organizationId: organization.id,
      customerId: customer.id,
      status: OrderStatus.PENDING,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      totalDzd: order1Total,
      items: {
        create: order1Items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPriceDzd: item.product.priceDzd,
        })),
      },
    },
  });

  const order2Items = [
    { product: products[2], quantity: 10 },
    { product: products[3], quantity: 2 },
  ];

  const order2Total = order2Items.reduce((sum, item) => sum + item.product.priceDzd * item.quantity, 0);

  const order2 = await prisma.order.create({
    data: {
      organizationId: organization.id,
      customerId: customer.id,
      status: OrderStatus.CONFIRMED,
      paymentMethod: PaymentMethod.EDAHABIA,
      totalDzd: order2Total,
      items: {
        create: order2Items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPriceDzd: item.product.priceDzd,
        })),
      },
    },
  });

  const order3Items = [
    { product: products[4], quantity: 5 },
    { product: products[8], quantity: 6 },
  ];

  const order3Total = order3Items.reduce((sum, item) => sum + item.product.priceDzd * item.quantity, 0);

  const order3 = await prisma.order.create({
    data: {
      organizationId: organization.id,
      customerId: customer2.id,
      status: OrderStatus.PACKED,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      totalDzd: order3Total,
      createdAt: addDays(new Date(), -3),
      items: {
        create: order3Items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPriceDzd: item.product.priceDzd,
        })),
      },
    },
  });

  const order4Items = [
    { product: products[5], quantity: 3 },
    { product: products[6], quantity: 1 },
  ];

  const order4Total = order4Items.reduce((sum, item) => sum + item.product.priceDzd * item.quantity, 0);

  const order4 = await prisma.order.create({
    data: {
      organizationId: organization.id,
      customerId: customer.id,
      status: OrderStatus.SHIPPED,
      paymentMethod: PaymentMethod.INVOICE_REQUEST,
      totalDzd: order4Total,
      createdAt: addDays(new Date(), -7),
      items: {
        create: order4Items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPriceDzd: item.product.priceDzd,
        })),
      },
    },
  });

  const order5Items = [{ product: products[7], quantity: 8 }];
  const order5Total = order5Items.reduce((sum, item) => sum + item.product.priceDzd * item.quantity, 0);

  const order5 = await prisma.order.create({
    data: {
      organizationId: organization.id,
      customerId: customer2.id,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      totalDzd: order5Total,
      createdAt: addDays(new Date(), -14),
      items: {
        create: order5Items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPriceDzd: item.product.priceDzd,
        })),
      },
    },
  });

  const now = new Date();

  // ---------------------------------------------------------------------
  // Inventory (3 items + movements)
  // ---------------------------------------------------------------------
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: "RAW-CU-001",
        name: "Câble cuivre 2.5mm² (rouleau)",
        type: InventoryType.RAW_MATERIAL,
        quantity: 42,
        minQuantity: 10,
        location: "Warehouse A / Rack 1",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: "RAW-DIN-RAIL",
        name: "Rail DIN 35mm (barre)",
        type: InventoryType.RAW_MATERIAL,
        quantity: 120,
        minQuantity: 40,
        location: "Warehouse A / Rack 3",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: "FG-PANEL-001",
        name: "Tableau de commande (assemblé)",
        type: InventoryType.FINISHED_GOOD,
        quantity: 6,
        minQuantity: 2,
        location: "Warehouse B / Finished",
      },
    }),
  ]);

  await prisma.stockMovement.createMany({
    data: [
      {
        inventoryItemId: inventoryItems[0].id,
        delta: -3,
        reason: "Commande #1 (préparation)",
        createdAt: addDays(now, -1),
      },
      {
        inventoryItemId: inventoryItems[1].id,
        delta: 25,
        reason: "Réception fournisseur",
        createdAt: addDays(now, -2),
      },
      {
        inventoryItemId: inventoryItems[2].id,
        delta: 1,
        reason: "Production terminée",
        createdAt: addDays(now, -3),
      },
    ],
  });

  // ---------------------------------------------------------------------
  // Production (1 order + 1 issue)
  // ---------------------------------------------------------------------
  const productionOrder = await prisma.productionOrder.create({
    data: {
      organizationId: organization.id,
      orderId: order2.id,
      status: ProductionStatus.MANUFACTURING,
      quantityTotal: order2Items.reduce((sum, i) => sum + i.quantity, 0),
      rawMaterialsQty: 0,
      manufacturingQty: 6,
      assemblyQty: 2,
      packagingQty: 0,
      packedQty: 0,
      deliveredQty: 0,
      isDelayed: true,
      bottleneckNotes: "Attente pièces (capteurs M18) + vérification QC.",
    },
  });

  await prisma.productionIssue.create({
    data: {
      productionOrderId: productionOrder.id,
      type: ProductionIssueType.MACHINE,
      description: "Arrêt machine (maintenance) - délai 24h.",
      createdAt: addDays(now, -1),
    },
  });

  const productionOrder2 = await prisma.productionOrder.create({
    data: {
      organizationId: organization.id,
      orderId: order3.id,
      status: ProductionStatus.PACKAGING,
      quantityTotal: order3Items.reduce((sum, i) => sum + i.quantity, 0),
      rawMaterialsQty: 0,
      manufacturingQty: 0,
      assemblyQty: 0,
      packagingQty: 10,
      packedQty: 1,
      deliveredQty: 0,
      isDelayed: false,
      bottleneckNotes: "Contrôle final + étiquetage.",
      createdAt: addDays(now, -2),
    },
  });

  // ---------------------------------------------------------------------
  // Suppliers + finance (supplier invoice, crm client, invoice, expense)
  // ---------------------------------------------------------------------
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        organizationId: organization.id,
        name: "SARL Electro Supply DZ",
        phone: "+213 550 10 20 30",
        email: "contact@electrosupply.dz",
        reliabilityScore: 82,
        lastPurchaseAt: addDays(now, -10),
      },
    }),
    prisma.supplier.create({
      data: {
        organizationId: organization.id,
        name: "EURL Meca Parts Alger",
        phone: "+213 540 33 44 55",
        email: "sales@mecaparts.dz",
        reliabilityScore: 74,
        lastPurchaseAt: addDays(now, -21),
      },
    }),
    prisma.supplier.create({
      data: {
        organizationId: organization.id,
        name: "SARL Plast & Co",
        phone: "+213 560 66 77 88",
        email: "hello@plastco.dz",
        reliabilityScore: 69,
        lastPurchaseAt: addDays(now, -6),
      },
    }),
  ]);

  await prisma.supplierInvoice.createMany({
    data: [
      {
        supplierId: suppliers[0].id,
        amountDzd: 145000,
        isPaid: false,
        dueDate: addDays(now, 14),
        createdAt: addDays(now, -2),
      },
      {
        supplierId: suppliers[1].id,
        amountDzd: 88000,
        isPaid: true,
        dueDate: addDays(now, 3),
        createdAt: addDays(now, -12),
      },
      {
        supplierId: suppliers[2].id,
        amountDzd: 62000,
        isPaid: false,
        dueDate: addDays(now, 10),
        createdAt: addDays(now, -1),
      },
    ],
  });

  const crmClients = await Promise.all([
    prisma.crmClient.create({
      data: {
        organizationId: organization.id,
        name: "EURL Atlas Industrie",
        email: "achat@atlas-industrie.dz",
        phone: "+213 770 11 22 33",
        isLoyal: true,
        debtDzd: 38000,
        notes: "Client fidèle, préfère paiement virement.",
      },
    }),
    prisma.crmClient.create({
      data: {
        organizationId: organization.id,
        name: "SPA HydraTech",
        email: "procurement@hydratech.dz",
        phone: "+213 661 88 99 00",
        isLoyal: false,
        debtDzd: 0,
        notes: "Prospect chaud - demande devis VFD.",
      },
    }),
    prisma.crmClient.create({
      data: {
        organizationId: organization.id,
        name: "SARL Oran Packaging",
        email: "finance@oranpack.dz",
        phone: "+213 780 12 12 12",
        isLoyal: true,
        debtDzd: 120000,
        notes: "Retard paiement - relance en cours.",
      },
    }),
  ]);

  await prisma.lead.createMany({
    data: [
      {
        organizationId: organization.id,
        name: "Nadia B.",
        email: "nadia.lead@example.com",
        phone: "+213 669 00 11 22",
        stage: "Qualified",
      },
      {
        organizationId: organization.id,
        name: "Karim H.",
        email: "karim.lead@example.com",
        phone: "+213 658 10 20 30",
        stage: "Contacted",
      },
      {
        organizationId: organization.id,
        name: "Yasmine R.",
        email: "yasmine.lead@example.com",
        phone: "+213 699 44 55 66",
        stage: "New",
      },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      {
        organizationId: organization.id,
        crmClientId: crmClients[0].id,
        amountDzd: 92000,
        isPaid: false,
        createdAt: addDays(now, -4),
      },
      {
        organizationId: organization.id,
        crmClientId: crmClients[2].id,
        amountDzd: 54000,
        isPaid: false,
        createdAt: addDays(now, -9),
      },
      {
        organizationId: organization.id,
        orderId: order4.id,
        amountDzd: order4Total,
        isPaid: false,
        createdAt: addDays(now, -6),
      },
    ],
  });

  await prisma.expense.create({
    data: {
      organizationId: organization.id,
      category: "Électricité",
      amountDzd: 21000,
      occurredAt: addDays(now, -5),
    },
  });

  // ---------------------------------------------------------------------
  // Notifications (2)
  // ---------------------------------------------------------------------
  await prisma.notification.createMany({
    data: [
      {
        organizationId: organization.id,
        userId: admin.id,
        title: "Alerte stock",
        message: "Câble cuivre 2.5mm² proche du seuil minimum.",
        urgency: Urgency.HIGH,
        createdAt: addDays(now, -1),
      },
      {
        organizationId: organization.id,
        userId: employee.id,
        title: "Tâche urgente",
        message: "Contrôle qualité capteurs M18 avant expédition.",
        urgency: Urgency.CRITICAL,
        createdAt: addDays(now, -1),
      },
      {
        organizationId: organization.id,
        userId: employeeAhmed.id,
        title: "Maintenance",
        message: "Maintenance préventive planifiée (convoyeur ligne A).",
        urgency: Urgency.MEDIUM,
        createdAt: addDays(now, -2),
      },
    ],
  });

  // ---------------------------------------------------------------------
  // Employee tasks (3 tasks, TODO/IN_PROGRESS mix)
  // ---------------------------------------------------------------------
  const tasks = await Promise.all([
    prisma.employeeTask.create({
      data: {
        organizationId: organization.id,
        employeeUserId: employee.id,
        title: "Préparer le picking de la commande #1",
        description: "Rassembler VFD + disjoncteurs, vérifier quantités et emballage.",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueAt: addDays(now, 2),
      },
    }),
    prisma.employeeTask.create({
      data: {
        organizationId: organization.id,
        employeeUserId: employee.id,
        title: "Contrôle qualité: capteurs M18",
        description: "Contrôler échantillon (10 pièces), tester sortie PNP, enregistrer résultats.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueAt: addDays(now, 4),
      },
    }),
    prisma.employeeTask.create({
      data: {
        organizationId: organization.id,
        employeeUserId: employee.id,
        title: "Mettre à jour le stock minimum (tableau)",
        description: "Définir seuils pour pièces critiques + alerte interne.",
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueAt: addDays(now, 7),
      },
    }),
    prisma.employeeTask.create({
      data: {
        organizationId: organization.id,
        employeeUserId: employeeAhmed.id,
        title: "Maintenance préventive: convoyeur ligne A",
        description: "Graissage + vérification capteurs + test arrêt d'urgence.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueAt: addDays(now, 1),
      },
    }),
  ]);

  await prisma.attendanceLog.createMany({
    data: [
      {
        employeeUserId: employee.id,
        date: addDays(now, -1),
        status: "PRESENT",
        checkInAt: addDays(now, -1),
        checkOutAt: addDays(now, -1),
      },
      {
        employeeUserId: employeeAhmed.id,
        date: addDays(now, -1),
        status: "LATE",
        checkInAt: addDays(now, -1),
      },
      {
        employeeUserId: employeeYacine.id,
        date: addDays(now, -1),
        status: "PRESENT",
        checkInAt: addDays(now, -1),
      },
    ],
  });

  await prisma.leaveRequest.create({
    data: {
      employeeUserId: employeeAhmed.id,
      status: "PENDING",
      reason: "RDV médical (maintenance équipe).",
      startDate: addDays(now, 5),
      endDate: addDays(now, 6),
      createdAt: addDays(now, -1),
    },
  });

  await prisma.employeeReport.create({
    data: {
      employeeUserId: employeeAhmed.id,
      type: "Maintenance",
      title: "Bruit anormal sur moteur convoyeur",
      description: "Vibrations + bruit côté roulement. Recommandation: arrêt 30min pour inspection.",
      attachmentUrls: [],
      urgency: Urgency.HIGH,
      createdAt: addDays(now, -1),
    },
  });

  await prisma.payroll.createMany({
    data: [
      {
        organizationId: organization.id,
        employeeUserId: employee.id,
        month: new Date(now.getFullYear(), now.getMonth(), 1),
        amountDzd: 85000,
        isPaid: true,
        createdAt: addDays(now, -2),
      },
      {
        organizationId: organization.id,
        employeeUserId: employeeAhmed.id,
        month: new Date(now.getFullYear(), now.getMonth(), 1),
        amountDzd: 78000,
        isPaid: false,
        createdAt: addDays(now, -2),
      },
    ],
  });

  // ---------------------------------------------------------------------
  // Calendar events (2 events)
  // ---------------------------------------------------------------------
  const events = await Promise.all([
    prisma.calendarEvent.create({
      data: {
        organizationId: organization.id,
        createdByUserId: admin.id,
        title: "Réunion planification production",
        description: "Synchronisation commandes / production / stock.",
        startAt: addDays(now, 1),
        endAt: addDays(now, 1),
        location: "SmartOps Lite HQ - Salle 2",
      },
    }),
    prisma.calendarEvent.create({
      data: {
        organizationId: organization.id,
        createdByUserId: admin.id,
        title: "Livraison fournisseur (électricité)",
        description: "Réception contacteurs + accessoires tableau.",
        startAt: addDays(now, 3),
        endAt: addDays(now, 3),
        location: "SmartOps Lite - Warehouse A",
      },
    }),
  ]);

  console.log("Seed completed successfully ✅");
  console.log(
    JSON.stringify(
      {
        organization: { id: organization.id, slug: organization.slug },
        users: { admin: admin.email, employee: employee.email, customer: customer.email },
        products: products.length,
        orders: [order1.id, order2.id, order3.id, order4.id, order5.id],
        inventoryItems: inventoryItems.length,
        productionOrders: [productionOrder.id, productionOrder2.id],
        tasks: tasks.map((t) => ({ id: t.id, status: t.status })),
        events: events.map((e) => e.id),
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("Seed failed ❌");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
