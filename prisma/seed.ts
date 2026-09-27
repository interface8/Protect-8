import { PrismaClient, Prisma, KnowledgeCenterCategory } from "@prisma/client";
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

  await prisma.lawyerProfile.upsert({
    where: { userId: lawyerUser.id },
    update: {
      barEnrollmentNumber: "NBA-DEMO-2026",
      practiceLicenseUrl: "https://example.com/demo-lawyer-license.pdf",
      idDocumentUrl: "https://example.com/demo-lawyer-id.pdf",
      practiceAreas: ["Property Law", "Land Disputes", "Civil Law"],
      languages: ["English", "Yoruba"],
      yearsOfExperience: 8,
      city: "Lagos",
      state: "Lagos State",
      verificationStatus: "APPROVED",
      isMatchable: true,
      availabilityStatus: "AVAILABLE",
      lastActivityAt: new Date(),
      availabilityUpdatedAt: new Date(),
      latitude: 6.5244,
      longitude: 3.3792,
      consultationFee: new Prisma.Decimal("25000"),
      responseTimeSeconds: 120,
      reviewedById: adminUser.id,
      reviewedAt: new Date(),
      rejectionReason: null,
    },
    create: {
      userId: lawyerUser.id,
      barEnrollmentNumber: "NBA-DEMO-2026",
      practiceLicenseUrl: "https://example.com/demo-lawyer-license.pdf",
      idDocumentUrl: "https://example.com/demo-lawyer-id.pdf",
      practiceAreas: ["Property Law", "Land Disputes", "Civil Law"],
      languages: ["English", "Yoruba"],
      yearsOfExperience: 8,
      city: "Lagos",
      state: "Lagos State",
      verificationStatus: "APPROVED",
      isMatchable: true,
      availabilityStatus: "AVAILABLE",
      lastActivityAt: new Date(),
      availabilityUpdatedAt: new Date(),
      latitude: 6.5244,
      longitude: 3.3792,
      consultationFee: new Prisma.Decimal("25000"),
      responseTimeSeconds: 120,
      reviewedById: adminUser.id,
      reviewedAt: new Date(),
    },
  });

  const extraLawyers = [
    { name: "Amina Bello", email: "amina.bello@protect8.dev", barNumber: "NBA-DEMO-2026-02", areas: ["Criminal Law", "Police Arrest", "Traffic Law"], city: "Lagos", state: "Lagos State", latitude: 6.5244, longitude: 3.3792, availability: "AVAILABLE" as const, fee: "30000", experience: 10 },
    { name: "Chidi Okafor", email: "chidi.okafor@protect8.dev", barNumber: "NBA-DEMO-2026-03", areas: ["Property Law", "Land Disputes"], city: "Abuja", state: "FCT", latitude: 9.0765, longitude: 7.3986, availability: "AVAILABLE" as const, fee: "35000", experience: 12 },
    { name: "Tunde Adebayo", email: "tunde.adebayo@protect8.dev", barNumber: "NBA-DEMO-2026-04", areas: ["Employment Law", "Civil Law"], city: "Ibadan", state: "Oyo State", latitude: 7.3775, longitude: 3.947, availability: "OFFLINE" as const, fee: "20000", experience: 7 },
    { name: "Ngozi Eze", email: "ngozi.eze@protect8.dev", barNumber: "NBA-DEMO-2026-05", areas: ["Family Law", "Domestic Violence"], city: "Enugu", state: "Enugu State", latitude: 6.4584, longitude: 7.5464, availability: "OFFLINE" as const, fee: "25000", experience: 9 },
    { name: "Musa Ibrahim", email: "musa.ibrahim@protect8.dev", barNumber: "NBA-DEMO-2026-06", areas: ["Criminal Law", "Civil Law"], city: "Kano", state: "Kano State", latitude: 12.0022, longitude: 8.592, availability: "OFFLINE" as const, fee: "18000", experience: 6 },
    { name: "Emeka Udo", email: "emeka.udo@protect8.dev", barNumber: "NBA-DEMO-2026-07", areas: ["Employment Law", "Labour Law"], city: "Port Harcourt", state: "Rivers State", latitude: 4.8156, longitude: 7.0498, availability: "AVAILABLE" as const, fee: "28000", experience: 11 },
    { name: "Bola Yusuf", email: "bola.yusuf@protect8.dev", barNumber: "NBA-DEMO-2026-08", areas: ["Family Law", "Domestic Violence"], city: "Lagos", state: "Lagos State", latitude: 6.4541, longitude: 3.3947, availability: "AVAILABLE" as const, fee: "32000", experience: 9 },
    { name: "Zainab Musa", email: "zainab.musa@protect8.dev", barNumber: "NBA-DEMO-2026-09", areas: ["Immigration Law", "Cybercrime", "Financial Crime", "Security Agency Matters"], city: "Abuja", state: "FCT", latitude: 9.0579, longitude: 7.4951, availability: "AVAILABLE" as const, fee: "40000", experience: 13 },
  ];

  for (let index = 0; index < extraLawyers.length; index += 1) {
    const lawyer = extraLawyers[index];
    const user = await prisma.user.upsert({
      where: { email: lawyer.email },
      update: {
        name: lawyer.name,
        password: await hash("lawyer123", 12),
        role: { connect: { id: lawyerRole.id } },
        isActive: true,
      },
      create: {
        email: lawyer.email,
        name: lawyer.name,
        password: await hash("lawyer123", 12),
        roleId: lawyerRole.id,
        isActive: true,
      },
    });
    const isAvailable = lawyer.availability === "AVAILABLE";
    await prisma.lawyerProfile.upsert({
      where: { userId: user.id },
      update: {
        barEnrollmentNumber: lawyer.barNumber,
        practiceLicenseUrl: `https://example.com/${lawyer.barNumber}-license.pdf`,
        idDocumentUrl: `https://example.com/${lawyer.barNumber}-id.pdf`,
        practiceAreas: lawyer.areas,
        languages: index === 1 ? ["English", "Hausa"] : ["English", "Yoruba"],
        yearsOfExperience: lawyer.experience,
        city: lawyer.city,
        state: lawyer.state,
        verificationStatus: "APPROVED",
        isMatchable: true,
        availabilityStatus: lawyer.availability,
        lastActivityAt: isAvailable ? new Date() : null,
        availabilityUpdatedAt: isAvailable ? new Date() : null,
        latitude: lawyer.latitude,
        longitude: lawyer.longitude,
        consultationFee: new Prisma.Decimal(lawyer.fee),
        responseTimeSeconds: 120 + index * 30,
        reviewedById: adminUser.id,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
      create: {
        userId: user.id,
        barEnrollmentNumber: lawyer.barNumber,
        practiceLicenseUrl: `https://example.com/${lawyer.barNumber}-license.pdf`,
        idDocumentUrl: `https://example.com/${lawyer.barNumber}-id.pdf`,
        practiceAreas: lawyer.areas,
        languages: index === 1 ? ["English", "Hausa"] : ["English", "Yoruba"],
        yearsOfExperience: lawyer.experience,
        city: lawyer.city,
        state: lawyer.state,
        verificationStatus: "APPROVED",
        isMatchable: true,
        availabilityStatus: lawyer.availability,
        lastActivityAt: isAvailable ? new Date() : null,
        availabilityUpdatedAt: isAvailable ? new Date() : null,
        latitude: lawyer.latitude,
        longitude: lawyer.longitude,
        consultationFee: new Prisma.Decimal(lawyer.fee),
        responseTimeSeconds: 120 + index * 30,
        reviewedById: adminUser.id,
        reviewedAt: new Date(),
      },
    });
  }

  const emergencyCategoryDefs = [
  { key: "traffic-stop", label: "Traffic Stop", iconKey: "traffic-stop", sortOrder: 1 },
  { key: "police-arrest", label: "Police Arrest", iconKey: "police-arrest", sortOrder: 2 },
  { key: "efcc-issue", label: "EFCC Issue", iconKey: "efcc-issue", sortOrder: 3 },
  { key: "land-dispute", label: "Land Dispute", iconKey: "land-dispute", sortOrder: 4 },
  { key: "domestic-violence", label: "Domestic Violence", iconKey: "domestic-violence", sortOrder: 5 },
  { key: "security-agency", label: "Security Agency", iconKey: "security-agency", sortOrder: 6 },
  { key: "employment-matter", label: "Employment Matter", iconKey: "employment-matter", sortOrder: 7 },
  { key: "fraud", label: "Fraud", iconKey: "fraud", sortOrder: 8 },
  { key: "cybercrime", label: "Cybercrime", iconKey: "cybercrime", sortOrder: 9 },
  { key: "immigration", label: "Immigration", iconKey: "immigration", sortOrder: 10 },
  { key: "other", label: "Other", iconKey: "other", sortOrder: 11 },
];

for (const category of emergencyCategoryDefs) {
  await prisma.emergencyCategory.upsert({
    where: { key: category.key },
    update: {
      label: category.label,
      iconKey: category.iconKey,
      sortOrder: category.sortOrder,
      isActive: true,
    },
    create: {
      id: category.key,
      key: category.key,
      label: category.label,
      iconKey: category.iconKey,
      sortOrder: category.sortOrder,
      isActive: true,
    },
  });
}

console.log("  ✅ Emergency categories seeded");

    const now = new Date();

  await prisma.emergencyRequest.deleteMany({
    where: {
      userId: {
        in: [citizenUser.id, lawyerUser.id],
      },
    },
  });

  await prisma.subscription.deleteMany({
    where: {
      userId: {
        in: [citizenUser.id, lawyerUser.id],
      },
    },
  });

  await prisma.reportSummary.deleteMany({
    where: {
      summaryKey: "platform_summary",
    },
  });

  await prisma.emergencyRequest.createMany({
    data: [
      {
        userId: citizenUser.id,
        category: "Police harassment",
        categoryId: "police-arrest",
        message: "Need urgent help after police stop.",
        status: "REQUESTED",
      },
      {
        userId: citizenUser.id,
        category: "Domestic violence",
        categoryId: "domestic-violence",
        message: "Need immediate support and legal guidance.",
        assignedToId: lawyerUser.id,
        status: "MATCHED",
        respondedAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        userId: citizenUser.id,
        category: "Land dispute",
        categoryId: "land-dispute",
        message: "Boundary issue with a neighbor.",
        assignedToId: lawyerUser.id,
        status: "COMPLETED",
        respondedAt: new Date(now.getTime() - 90 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 15 * 60 * 1000),
      },
    ],
  });

  const seededEmergencyRequests = await prisma.emergencyRequest.findMany({
    where: { userId: citizenUser.id },
    select: { id: true, status: true, userId: true },
  });

  await prisma.emergencyRequestStatusHistory.createMany({
    data: seededEmergencyRequests.map((request) => ({
      requestId: request.id,
      fromStatus: null,
      toStatus: request.status,
      actorId: request.userId,
    })),
  });

  await prisma.subscription.createMany({
    data: [
      {
        userId: citizenUser.id,
        planName: "Citizen Pro",
        amount: new Prisma.Decimal("25000"),
        currency: "NGN",
        status: "ACTIVE",
        startsAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        userId: lawyerUser.id,
        planName: "Lawyer Pro",
        amount: new Prisma.Decimal("50000"),
        currency: "NGN",
        status: "ACTIVE",
        startsAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        planName: "Admin Internal",
        amount: new Prisma.Decimal("0"),
        currency: "NGN",
        status: "PAUSED",
        startsAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.reportSummary.create({
    data: {
      summaryKey: "platform_summary",
      registeredLawyers: 1,
      activeUsers: 3,
      averageLawyerResponseTime: 45,
      emergencyResponseRate: 66.67,
      monthlyRecurringRevenue: new Prisma.Decimal("75000"),
      caseCompletionRate: 0,
      computedAt: new Date(),
    },
  });

    const rightsGuideDefs = [
    {
      slug: "traffic-stop",
      title: "Traffic Stop",
      iconKey: "car",
      shortDescription: "Rights when pulled over by traffic police",
      body: [
        "## What You Should Do",
        "1. Remain calm and pull over safely and promptly",
        "2. Keep your hands visible on the steering wheel",
        "3. Provide driver's license, vehicle registration, and insurance when requested",
        "4. Ask politely for the reason for the stop",
        "5. Inform the officer before reaching for any documents",
        "6. You may contact your lawyer before answering further questions",
        "",
        "## What To Avoid",
        "- Do not argue or resist physically under any circumstances",
        "- Do not make sudden movements without informing the officer",
        "- Do not consent to a vehicle search unless legally required",
        "- Do not provide false information to an officer",
      ].join("\n"),
      order: 1,
    },
    {
      slug: "police-arrest",
      title: "Police Arrest",
      iconKey: "handcuffs",
      shortDescription:
        "Understand your rights if you are being arrested or detained by police.",
      body: [
        "## What You Should Do",
        "1. Remain calm and cooperate without resisting physically",
        "2. Ask for the reason for the arrest",
        "3. Exercise your right to remain silent",
        "4. Request a lawyer",
        "5. Note the officers involved, the time, the location, and any charges mentioned",
        "",
        "## What To Avoid",
        "- Do not resist arrest physically",
        "- Do not give detailed statements without legal advice",
        "- Do not sign documents you do not understand",
      ].join("\n"),
      order: 2,
    },
    {
      slug: "efcc-issue",
      title: "EFCC / Agency Invitation",
      iconKey: "building",
      shortDescription:
        "Learn how to respond safely to invitations from EFCC or other agencies.",
      body: [
        "## What You Should Do",
        "1. Read the notice carefully and confirm the issuing office, date, and reason",
        "2. Speak to a lawyer before making statements or submitting documents",
        "3. Bring only what is necessary",
        "4. Keep copies of all letters, emails, and messages",
        "5. Verify any vague, threatening, or unusual invitation before responding",
        "",
        "## What To Avoid",
        "- Do not ignore the invitation",
        "- Do not attend without understanding the scope of the matter",
        "- Do not make statements or hand over documents without legal advice",
      ].join("\n"),
      order: 3,
    },
    {
      slug: "land-dispute",
      title: "Land Dispute",
      iconKey: "map",
      shortDescription:
        "Steps to protect your interest when a land boundary or ownership dispute arises.",
      body: [
        "## What You Should Do",
        "1. Gather your title documents, survey plans, receipts, and agreements",
        "2. Collect photographs and any correspondence related to the land",
        "3. Note the witnesses who can confirm your history of possession",
        "4. Put every arrangement in writing",
        "5. Consult a lawyer early so your evidence is organized and preserved",
        "",
        "## What To Avoid",
        "- Do not destroy structures on the land",
        "- Do not use force to settle the matter",
        "- Do not rely on verbal arrangements without written proof",
      ].join("\n"),
      order: 4,
    },
    {
      slug: "domestic-violence",
      title: "Domestic Violence",
      iconKey: "shield-heart",
      shortDescription:
        "Safety-first guidance if you are facing abuse or threats at home.",
      body: [
        "## What You Should Do",
        "1. If you are in immediate danger, leave the area if it is safe to do so",
        "2. Contact emergency services or a trusted person right away",
        "3. Save messages, photos, and medical reports if it is safe to keep them",
        "4. Reach out for legal help and support services quickly",
        "5. Ask a lawyer about protective options and urgent next steps",
        "",
        "## What To Avoid",
        "- Do not confront an abusive person alone if it may increase your risk",
        "- Do not delete evidence of abuse that you can safely keep",
      ].join("\n"),
      order: 5,
    },
    {
      slug: "employment-matter",
      title: "Employment Matter",
      iconKey: "briefcase",
      shortDescription:
        "Know your options when dealing with dismissal, unpaid salary, or workplace issues.",
      body: [
        "## What You Should Do",
        "1. Keep your employment letter, payslips, emails, chat messages, and disciplinary notices",
        "2. Record the dates and the exact messages exchanged",
        "3. Review your contract",
        "4. Speak with a lawyer before accepting any settlement",
        "",
        "## What To Avoid",
        "- Do not resign in anger without understanding the consequences",
        "- Do not sign a release you do not understand",
      ].join("\n"),
      order: 6,
    },
    {
      slug: "security-agency",
      title: "Security Agency Encounter",
      iconKey: "shield",
      shortDescription:
        "Practical steps when dealing with a security agency, checkpoint, or official inquiry.",
      body: [
        "## What You Should Do",
        "1. Stay calm, keep your hands visible, and follow lawful safety instructions",
        "2. Ask which agency the officers represent and why they are stopping or contacting you",
        "3. Provide identification or documents that are lawfully required",
        "4. Record names, badge numbers, time, place, and witnesses when it is safe",
        "5. Contact a lawyer if you are detained, questioned about an offence, or asked to sign a statement",
        "",
        "## What To Avoid",
        "- Do not resist physically or obstruct officers",
        "- Do not offer a bribe or give false information",
        "- Do not sign a statement you have not read or do not understand",
      ].join("\n"),
      order: 7,
    },
    {
      slug: "fraud",
      title: "Fraud or Financial Crime",
      iconKey: "shield-alert",
      shortDescription:
        "Protect evidence and respond carefully if you are accused of or affected by fraud.",
      body: [
        "## What You Should Do",
        "1. Preserve messages, receipts, bank records, contracts, and transaction references",
        "2. Contact your bank or payment provider promptly if money was taken or sent by mistake",
        "3. Write down a clear timeline and keep copies of any complaint or official notice",
        "4. Verify requests for money or sensitive information through official contact details",
        "5. Speak with a lawyer before giving a formal statement or responding to an accusation",
        "",
        "## What To Avoid",
        "- Do not delete, edit, or fabricate records",
        "- Do not move or hide funds to avoid an investigation",
        "- Do not publish accusations or private information while the facts are being checked",
      ].join("\n"),
      order: 8,
    },
    {
      slug: "cybercrime",
      title: "Cybercrime or Online Account Abuse",
      iconKey: "laptop",
      shortDescription:
        "Secure your accounts and preserve digital evidence when an online incident occurs.",
      body: [
        "## What You Should Do",
        "1. From a trusted device, change affected passwords and enable two-factor authentication",
        "2. Contact your bank, mobile provider, or platform through its official support channel",
        "3. Save URLs, messages, emails, screenshots, dates, and transaction references",
        "4. Report immediate financial loss or threats to the appropriate authorities",
        "5. Ask a lawyer how to preserve evidence and respond to any official request for your device or data",
        "",
        "## What To Avoid",
        "- Do not delete chats, files, or account alerts that may be evidence",
        "- Do not access another person's account or device in response",
        "- Do not share passwords, verification codes, or recovery keys with callers or message senders",
      ].join("\n"),
      order: 9,
    },
    {
      slug: "immigration",
      title: "Immigration Matter",
      iconKey: "globe",
      shortDescription:
        "Organize your documents and get advice about visas, permits, detention, or removal notices.",
      body: [
        "## What You Should Do",
        "1. Keep copies of your passport, visa, permits, application receipts, and correspondence",
        "2. Check the issuing authority, deadline, and instructions on every notice you receive",
        "3. Attend required appointments and keep proof of attendance or submission",
        "4. Ask for an interpreter if you do not understand a question or document",
        "5. Speak with an immigration lawyer promptly if you are detained or given a deadline to leave",
        "",
        "## What To Avoid",
        "- Do not ignore official deadlines or appointments",
        "- Do not submit altered documents or make statements you know are false",
        "- Do not sign a document you cannot read or understand without asking for help",
      ].join("\n"),
      order: 10,
    },
    {
      slug: "other",
      title: "Another Legal Situation",
      iconKey: "scale",
      shortDescription:
        "Not sure which guide fits? Protect your records and browse all available lawyers for help.",
      body: [
        "## What You Should Do",
        "1. If anyone is in immediate danger, move to safety and contact local emergency services",
        "2. Write down what happened, when it happened, where it happened, and who was involved",
        "3. Keep related letters, contracts, receipts, messages, photographs, and other records",
        "4. Note any deadline, hearing date, appointment, or request for a response",
        "5. Choose Connect to a Lawyer to browse all available lawyers and explain your situation in your enquiry",
        "",
        "## What To Avoid",
        "- Do not destroy records or alter evidence",
        "- Do not sign an agreement you do not understand",
        "- Do not miss a stated deadline while waiting for informal advice",
        "",
        "This guide is a starting point. The lawyer you contact can help identify the right area of law and the next steps for your specific circumstances.",
      ].join("\n"),
      order: 11,
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

   const articleDefs: Array<{
    slug: string;
    title: string;
    excerpt: string;
    body: string;
    category: KnowledgeCenterCategory;
    readTimeMinutes: number;
  }> = [
    {
      slug: "know-your-rights-when-stopped-by-police",
      title: "Know Your Rights When Stopped by Police",
      excerpt:
        "A practical guide to staying calm, protecting yourself, and handling a police stop safely.",
      body:
        "If police stop you, stay calm and keep your hands visible. Ask for the reason for the stop. Provide your license and other required documents when lawfully requested, but do not volunteer extra information. You do not have to consent to a search without a lawful basis. If the stop becomes aggressive or confusing, record details as soon as it is safe, including the officer's name, badge number, time, and location. Seek legal help quickly if your rights may have been violated.",
      category: "TRAFFIC_LAW",
      readTimeMinutes: 4,
    },
    {
      slug: "what-to-do-after-an-efcc-invitation",
      title: "What to Do After an EFCC Invitation",
      excerpt:
        "Steps to take before attending, responding, or submitting documents to an agency.",
      body:
        "If you receive an EFCC or agency invitation, read it carefully and confirm the issuing office, date, and reason. Do not ignore it, but also do not attend blindly. Speak to a lawyer before making statements or submitting documents. Keep copies of all letters, emails, and messages. If the invitation is vague, threatening, or unusual, verify it before responding and get legal support as early as possible.",
      category: "FINANCIAL_CRIME",
      readTimeMinutes: 5,
    },
    {
      slug: "your-privacy-rights-online-and-on-your-phone",
      title: "Your Privacy Rights Online and on Your Phone",
      excerpt:
        "Understand what private data is protected and how to respond to requests for access.",
      body:
        "Your personal messages, account data, and private records should not be shared casually. Before giving out sensitive information, confirm who is asking, why they need it, and whether they have lawful authority. Avoid posting personal documents publicly. If your phone, accounts, or private data are being accessed without permission, preserve evidence and seek legal advice. Privacy issues often become more serious when records are deleted or altered, so act early.",
      category: "PRIVACY_RIGHTS",
      readTimeMinutes: 4,
    },
    {
      slug: "how-to-handle-a-land-dispute",
      title: "How to Handle a Land Dispute",
      excerpt:
        "Protect your documents, evidence, and possession history when land ownership is challenged.",
      body:
        "Land disputes often depend on documents, witnesses, and possession history. Gather your title documents, survey plans, receipts, agreements, photographs, and correspondence related to the property. Do not destroy structures or use force to settle the matter. Avoid verbal arrangements without written proof. If there is a boundary or ownership disagreement, consult a lawyer early so your evidence can be organized and preserved properly.",
      category: "PROPERTY_LAW",
      readTimeMinutes: 5,
    },
    {
      slug: "understanding-your-rights-during-a-police-arrest",
      title: "Understanding Your Rights During a Police Arrest",
      excerpt:
        "What to say, what not to sign, and how to protect yourself during detention.",
      body:
        "If police tell you that you are under arrest, remain calm and do not resist physically. You have the right to remain silent and the right to request a lawyer. Ask for the reason for the arrest, but avoid detailed statements without legal advice. Do not sign documents you do not understand. If possible, note the officers involved, the time, location, and any charges mentioned. A lawyer can help you challenge an unlawful arrest or protect your rights during questioning and detention.",
      category: "CRIMINAL_RIGHTS",
      readTimeMinutes: 4,
    },
    {
      slug: "what-to-do-about-unpaid-salary-or-dismissal",
      title: "What to Do About Unpaid Salary or Dismissal",
      excerpt:
        "Practical steps if you are dealing with workplace disputes, suspension, or termination.",
      body:
        "If you have a workplace problem, keep your employment letter, payslips, emails, chat messages, and any disciplinary notices. Do not resign in anger without understanding the consequences. If you were dismissed, suspended, or not paid as expected, record the dates and the exact messages exchanged. Review your contract and speak with a lawyer before accepting any settlement or signing a release you do not understand.",
      category: "PROPERTY_LAW",
      readTimeMinutes: 5,
    },
  ];

  for (const article of articleDefs) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        category: article.category,
        readTimeMinutes: article.readTimeMinutes,
        isPublished: true,
        isFlagged: false,
        flagReason: null,
        flaggedAt: null,
        updatedById: adminUser.id,
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        category: article.category,
        readTimeMinutes: article.readTimeMinutes,
        isPublished: true,
        isFlagged: false,
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });
  }

  console.log("  ✅ Knowledge Center articles seeded");

  console.log("  ✅ Reporting seed data created");
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
