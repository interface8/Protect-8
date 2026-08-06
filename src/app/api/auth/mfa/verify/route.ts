import { NextRequest, NextResponse } from "next/server";
import { authService, verifyMfaSchema } from "@/modules/auth";
import {
  consumeMfaRateLimits,
  getRequestIp,
  MFA_RATE_LIMIT_WINDOW_MS,
  MFA_VERIFY_CHALLENGE_LIMIT,
  MFA_VERIFY_IP_LIMIT,
} from "@/lib/auth/rate-limit";

function rateLimitedResponse(resetAt: Date) {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((resetAt.getTime() - Date.now()) / 1000),
  );

  return NextResponse.json(
    {
      message: "Too many requests. Please try again later.",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyMfaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const ip = getRequestIp(request);

    const rateLimit = await consumeMfaRateLimits([
      {
        key: `mfa:verify:ip:${ip}`,
        action: "verify",
        limit: MFA_VERIFY_IP_LIMIT,
        windowMs: MFA_RATE_LIMIT_WINDOW_MS,
      },
      {
        key: `mfa:verify:challenge:${parsed.data.challengeId}`,
        action: "verify",
        limit: MFA_VERIFY_CHALLENGE_LIMIT,
        windowMs: MFA_RATE_LIMIT_WINDOW_MS,
      },
    ]);

    if (!rateLimit.allowed) {
      return rateLimitedResponse(rateLimit.resetAt);
    }

    const result = await authService.verifyMfa(parsed.data);

    return NextResponse.json(
      {
        message: "MFA verified successfully",
        verified: result.verified,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Invalid MFA challenge"
        ? 404
        : message === "MFA code already used" ||
            message === "MFA code expired" ||
            message === "MFA attempts exceeded" ||
            message === "Invalid MFA code"
          ? 400
          : 500;

    return NextResponse.json({ message }, { status });
  }
}