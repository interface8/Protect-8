import { prisma } from "@/lib/prisma";
import { hashMfaCode, hashToken } from "@/lib/auth/session";
import type { AuthProvider, MfaChannel, MfaPurpose } from "@/lib/auth/constants";

export async function findRoleByName(name: string) {
  return prisma.role.findUnique({
    where: { name },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
}

export async function findUserByPhone(phone: string) {
  return prisma.user.findUnique({
    where: { phone },
    include: { role: true },
  });
}

export async function findUserByProvider(provider: AuthProvider, providerId: string) {
  return prisma.user.findFirst({
    where: {
      authProvider: provider,
      providerId,
    },
    include: { role: true },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
}

export async function findUserByEmailOrPhone(input: {
  email?: string;
  phone?: string;
}) {
  return prisma.user.findFirst({
    where: {
      OR: [
        input.email ? { email: input.email } : undefined,
        input.phone ? { phone: input.phone } : undefined,
      ].filter(Boolean) as Array<{ email?: string; phone?: string }>,
    },
    include: { role: true },
  });
}

export async function createUser(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  password?: string | null;
  roleId: string;
  authProvider?: string | null;
  providerId?: string | null;
}) {
  return prisma.user.create({
    data,
    include: { role: true },
  });
}

export async function createRefreshToken(data: {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
}) {
  return prisma.refreshToken.create({
    data: {
      userId: data.userId,
      tokenHash: hashToken(data.refreshToken),
      expiresAt: data.expiresAt,
    },
  });
}

export async function findRefreshToken(refreshToken: string) {
  return prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
    include: {
      user: {
        include: { role: true },
      },
    },
  });
}

export async function revokeRefreshToken(input: {
  refreshToken: string;
  replacedByTokenHash?: string | null;
}) {
  return prisma.refreshToken.update({
    where: { tokenHash: hashToken(input.refreshToken) },
    data: {
      revokedAt: new Date(),
      replacedByToken: input.replacedByTokenHash ?? null,
    },
  });
}

export async function createMfaChallenge(data: {
  userId: string;
  purpose: MfaPurpose;
  channel: MfaChannel;
  code: string;
  expiresAt: Date;
  maxAttempts: number;
}) {
  return prisma.mfaCode.create({
    data: {
      userId: data.userId,
      purpose: data.purpose,
      channel: data.channel,
      codeHash: hashMfaCode(data.code),
      expiresAt: data.expiresAt,
      maxAttempts: data.maxAttempts,
    },
  });
}

export async function findMfaChallenge(challengeId: string) {
  return prisma.mfaCode.findUnique({
    where: { id: challengeId },
  });
}

export async function incrementMfaAttempts(challengeId: string) {
  return prisma.mfaCode.update({
    where: { id: challengeId },
    data: {
      attempts: {
        increment: 1,
      },
    },
  });
}

export async function markMfaUsed(challengeId: string) {
  return prisma.mfaCode.update({
    where: { id: challengeId },
    data: {
      usedAt: new Date(),
    },
  });
}