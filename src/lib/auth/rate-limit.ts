import { prisma } from "@/lib/prisma";

export const MFA_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export const MFA_SEND_IP_LIMIT = 5;
export const MFA_SEND_CONTACT_LIMIT = 3;

export const MFA_VERIFY_IP_LIMIT = 10;
export const MFA_VERIFY_CHALLENGE_LIMIT = 5;

type RateLimitBucket = {
  key: string;
  action: "send" | "verify";
  limit: number;
  windowMs: number;
};

type RateLimitAllowed = {
  allowed: true;
};

type RateLimitBlocked = {
  allowed: false;
  key: string;
  resetAt: Date;
};

export type RateLimitResult = RateLimitAllowed | RateLimitBlocked;

export async function consumeMfaRateLimits(
  buckets: RateLimitBucket[],
): Promise<RateLimitResult> {
  const now = new Date();

  const records = await prisma.mfaRateLimit.findMany({
    where: {
      key: {
        in: buckets.map((bucket) => bucket.key),
      },
    },
  });

  const recordMap = new Map(records.map((record) => [record.key, record]));

  for (const bucket of buckets) {
    const record = recordMap.get(bucket.key);

    if (!record || record.expiresAt.getTime() <= now.getTime()) {
      continue;
    }

    if (record.count >= bucket.limit) {
      return {
        allowed: false,
        key: bucket.key,
        resetAt: record.expiresAt,
      };
    }
  }

  await prisma.$transaction(
    buckets.map((bucket) => {
      const record = recordMap.get(bucket.key);
      const resetAt = new Date(now.getTime() + bucket.windowMs);
      const isExpired = !record || record.expiresAt.getTime() <= now.getTime();

      if (isExpired) {
        return prisma.mfaRateLimit.upsert({
          where: { key: bucket.key },
          create: {
            key: bucket.key,
            action: bucket.action,
            count: 1,
            windowStart: now,
            expiresAt: resetAt,
          },
          update: {
            action: bucket.action,
            count: 1,
            windowStart: now,
            expiresAt: resetAt,
          },
        });
      }

      return prisma.mfaRateLimit.update({
        where: { key: bucket.key },
        data: {
          action: bucket.action,
          count: { increment: 1 },
        },
      });
    }),
  );

  return { allowed: true };
}

export function getRequestIp(request: { headers: Headers }) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}