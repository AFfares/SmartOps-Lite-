"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { Role } from "@prisma/client";

const companySchema = z.object({
  companyName: z.string().min(2).max(80),
  companySlug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  adminName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

const employeeSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  joinCode: z.string().min(3).max(40),
});

const customerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  companySlug: z.string().min(2).max(50),
});

export async function signUpCompanyAdmin(formData: FormData) {
  const parsed = companySchema.safeParse({
    companyName: formData.get("companyName"),
    companySlug: formData.get("companySlug"),
    adminName: formData.get("adminName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/sign-up?error=invalid_company`);
  }

  const { companyName, companySlug, adminName, email, password } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } });
  if (existingUser) redirect(`/sign-up?error=email_in_use`);

  const existingOrg = await db.organization.findUnique({ where: { slug: companySlug }, select: { id: true } });
  if (existingOrg) redirect(`/sign-up?error=slug_in_use`);

  const passwordHash = await bcrypt.hash(password, 12);

  await db.organization.create({
    data: {
      name: companyName,
      slug: companySlug,
      joinCode: `DZ-${companySlug.toUpperCase().slice(0, 12)}-${new Date().getFullYear()}`,
      users: {
        create: {
          name: adminName,
          email: email.toLowerCase(),
          passwordHash,
          role: Role.COMPANY_ADMIN,
        },
      },
    },
  });

  redirect("/sign-in?created=1");
}

export async function signUpEmployee(formData: FormData) {
  const parsed = employeeSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    joinCode: formData.get("joinCode"),
  });

  if (!parsed.success) redirect(`/sign-up?error=invalid_employee`);

  const { name, email, password, joinCode } = parsed.data;

  const org = await db.organization.findUnique({ where: { joinCode }, select: { id: true } });
  if (!org) redirect(`/sign-up?error=join_code_not_found`);

  const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } });
  if (existingUser) redirect(`/sign-up?error=email_in_use`);

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: Role.EMPLOYEE,
      organizationId: null,
    },
    select: { id: true },
  });

  await db.joinRequest.create({
    data: {
      organizationId: org.id,
      userId: user.id,
    },
  });

  redirect("/sign-in?pending=1");
}

export async function signUpCustomer(formData: FormData) {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    companySlug: formData.get("companySlug"),
  });

  if (!parsed.success) redirect(`/sign-up?error=invalid_customer`);

  const { name, email, password, companySlug } = parsed.data;

  const org = await db.organization.findUnique({ where: { slug: companySlug }, select: { id: true } });
  if (!org) redirect(`/sign-up?error=company_not_found`);

  const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } });
  if (existingUser) redirect(`/sign-up?error=email_in_use`);

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: Role.CUSTOMER,
      organizationId: org.id,
      customerProfile: { create: {} },
    },
  });

  redirect("/sign-in?created=1");
}
