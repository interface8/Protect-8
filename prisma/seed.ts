import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const permissionDefs = [
    { resource: "users", action: "create", description: "Create users" },
    { resource: "users", action: "read", description: "View users" },
    { resource: "users", action: "update", description: "Update users" },
    { resource: "users", action: "delete", description: "Delete users" },
    { resource: "roles", action: "create", description: "Create roles" },
    { resource: "roles", action: "read", description: "View roles" },
    { resource: "roles", action: "update", description: "Update roles" },
    { resource: "roles", action: "delete", description: "Delete roles" },
    { resource: "permissions", action: "create", description: "Create permissions" },
    { resource: "permissions", action: "read", description: "View permissions" },
    { resource: "permissions", action: "update", description: "Update permissions" },
    { resource: "permissions", action: "delete", description: "Delete permissions" },
  ];

  const permissions = [];
  for (const def of permissionDefs) {
    const permission = await prisma.permission.upsert({
      where: { resource_action: { resource: def.resource, action: def.action } },
      update: {},
      create: def,
    });
    permissions.push(permission);
  }

  console.log(`  ✅ ${permissions.length} permissions created`);

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: { description: "Full system administrator" },
    create: {
      name: "admin",
      description: "Full system administrator",
    },
  });

  const lawyerRole = await prisma.role.upsert({
    where: { name: "lawyer" },
    update: { description: "Licensed lawyer" },
    create: {
      name: "lawyer",
      description: "Licensed lawyer",
    },
  });

  const citizenRole = await prisma.role.upsert({
    where: { name: "citizen" },
    update: { description: "Platform citizen" },
    create: {
      name: "citizen",
      description: "Platform citizen",
    },
  });

  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  const readPermissions = permissions.filter((p) => p.action === "read");
  for (const perm of readPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: lawyerRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: lawyerRole.id,
        permissionId: perm.id,
      },
    });
  }

  console.log("  ✅ Roles seeded");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@protect8.dev" },
    update: {
      password: await hash("admin123", 12),
      name: "System Admin",
      role: { connect: { id: adminRole.id } },
      phone: null,
      isActive: true,
    },
    create: {
      email: "admin@protect8.dev",
      password: await hash("admin123", 12),
      name: "System Admin",
      roleId: adminRole.id,
      isActive: true,
    },
  });

  const lawyerUser = await prisma.user.upsert({
    where: { email: "lawyer@protect8.dev" },
    update: {
      password: await hash("lawyer123", 12),
      name: "Demo Lawyer",
      role: { connect: { id: lawyerRole.id } },
      phone: null,
      isActive: true,
    },
    create: {
      email: "lawyer@protect8.dev",
      password: await hash("lawyer123", 12),
      name: "Demo Lawyer",
      roleId: lawyerRole.id,
      isActive: true,
    },
  });

  const citizenUser = await prisma.user.upsert({
    where: { email: "citizen@protect8.dev" },
    update: {
      password: await hash("citizen123", 12),
      name: "Demo Citizen",
      role: { connect: { id: citizenRole.id } },
      phone: null,
      isActive: true,
    },
    create: {
      email: "citizen@protect8.dev",
      password: await hash("citizen123", 12),
      name: "Demo Citizen",
      roleId: citizenRole.id,
      isActive: true,
    },
  });

     const rightsGuideDefs = [
    {
      slug: "traffic-stop",
      title: "Traffic Stop",
      iconKey: "car",
      shortDescription:
        "Know what to do, what to say, and what not to hand over during a traffic stop.",
      body:
        "If you are stopped by police while driving, stay calm and keep your hands visible. Ask why you were stopped if it is not clear. You should provide your driver's license, vehicle registration, and proof of insurance if requested, but you do not have to consent to a search without a lawful basis. Do not argue on the roadside. If you believe your rights are being violated, note the officer's name, badge number, time, location, and any witness details as soon as it is safe. If the stop escalates or you feel unsafe, seek legal help immediately.",
      order: 1,
    },
    {
      slug: "police-arrest",
      title: "Police Arrest",
      iconKey: "handcuffs",
      shortDescription:
        "Understand your rights if you are being arrested or detained by police.",
      body:
        "If police tell you that you are under arrest, remain calm and do not resist physically. You have the right to remain silent and the right to request a lawyer. Ask for the reason for the arrest, but avoid giving detailed statements without legal advice. Do not sign documents you do not understand. If possible, remember the officers involved, the time, location, and any charges mentioned. A lawyer can help you challenge an unlawful arrest or protect your rights during questioning and detention.",
      order: 2,
    },
    {
      slug: "efcc-agency-invitation",
      title: "EFCC / Agency Invitation",
      iconKey: "building",
      shortDescription:
        "Learn how to respond safely to invitations from EFCC or other agencies.",
      body:
        "If you receive an invitation from EFCC or another government agency, read the notice carefully and confirm the issuing office, date, and reason. Do not ignore the invitation, but also do not attend without understanding the scope of the matter. Speak to a lawyer before making statements or submitting documents. Bring only what is necessary and keep copies of any letters, emails, or messages. If the invitation is vague, threatening, or appears unusual, verify it before responding and get legal support quickly.",
      order: 3,
    },
    {
      slug: "land-dispute",
      title: "Land Dispute",
      iconKey: "map",
      shortDescription:
        "Steps to protect your interest when a land boundary or ownership dispute arises.",
      body:
        "Land disputes often depend on documents, witnesses, and history of possession. Gather your title documents, survey plans, receipts, agreements, photographs, and any correspondence related to the land. Do not destroy structures or use force to settle the matter. Avoid verbal arrangements without written proof. If there is a disagreement over boundaries or ownership, consult a lawyer early so your evidence can be organized and preserved properly.",
      order: 4,
    },
    {
      slug: "domestic-violence",
      title: "Domestic Violence",
      iconKey: "shield-heart",
      shortDescription:
        "Safety-first guidance if you are facing abuse or threats at home.",
      body:
        "If you are in immediate danger, leave the area if it is safe to do so and contact emergency services or a trusted person right away. Save messages, photos, medical reports, and any other evidence of abuse if it is safe to keep them. Do not confront an abusive person alone if doing so may increase risk. Reach out for legal help and support services quickly. A lawyer can help you understand protective options and urgent next steps.",
      order: 5,
    },
    {
      slug: "employment-matter",
      title: "Employment Matter",
      iconKey: "briefcase",
      shortDescription:
        "Know your options when dealing with dismissal, unpaid salary, or workplace issues.",
      body:
        "If you have a workplace problem, keep your employment letter, payslips, emails, chat messages, and any disciplinary notices. Do not resign in anger without understanding the consequences. If you were dismissed, suspended, or not paid as expected, record the dates and the exact messages exchanged. Review your contract and speak with a lawyer before accepting any settlement or signing a release you do not understand.",
      order: 6,
    },
  ];

  for (const guide of rightsGuideDefs) {
    await prisma.rightsGuide.upsert({
      where: { slug: guide.slug },
      update: {
        title: guide.title,
        iconKey: guide.iconKey,
        shortDescription: guide.shortDescription,
        body: guide.body,
        order: guide.order,
        isActive: true,
      },
      create: {
        slug: guide.slug,
        title: guide.title,
        iconKey: guide.iconKey,
        shortDescription: guide.shortDescription,
        body: guide.body,
        order: guide.order,
        isActive: true,
      },
    });
  }

  console.log("  ✅ Rights guides seeded");

  console.log("  ✅ Demo users seeded");
  console.log("  - admin@protect8.dev / admin123");
  console.log("  - lawyer@protect8.dev / lawyer123");
  console.log("  - citizen@protect8.dev / citizen123");

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
