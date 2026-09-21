import { NextRequest, NextResponse } from "next/server";
import { authService, loginSchema } from "@/modules/auth";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const session = await authService.login(parsed.data);

    const response = NextResponse.json(
      {
        message: "Login successful",
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
      },
      { status: 200 },
    );

    return setAuthCookies(response, session.accessToken, session.refreshToken);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    const status =
      message === "Invalid credentials"
        ? 401
        : message === "Google sign-in is not configured"
          ? 503
          : message === "Apple sign-in is not yet available"
            ? 503
            : 500;

    return NextResponse.json({ message }, { status });
  }
}
