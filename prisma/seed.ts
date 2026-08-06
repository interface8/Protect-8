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
