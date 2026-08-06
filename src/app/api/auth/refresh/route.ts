import { NextRequest, NextResponse } from "next/server";
import { authService, refreshSchema } from "@/modules/auth";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const cookieRefreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

    const parsed = refreshSchema.safeParse({
      refreshToken: body.refreshToken ?? cookieRefreshToken,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const session = await authService.refresh(parsed.data);

    const response = NextResponse.json(
      {
        message: "Token refreshed successfully",
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
      message === "Invalid refresh token" || message === "Refresh token expired"
        ? 401
        : 500;

    return NextResponse.json({ message }, { status });
  }
}
