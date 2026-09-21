import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { userService } from "@/modules/users";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/http";

export async function POST(request: NextRequest) {
  const guard = await requireApiRole(["citizen", "lawyer"]);
  if (isErrorResponse(guard)) return guard;

  try {
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return errorResponse("Avatar file is required", 400);
    }

    if (!file.type.startsWith("image/")) {
      return errorResponse("Avatar must be an image", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("Avatar must be 5MB or smaller", 400);
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const pathname = `avatars/${guard.id}/${Date.now()}.${extension}`;

    const blob = await put(pathname, file, {
      access: "public",
    });

    const user = await userService.setUserAvatar(guard.id, blob.url);

    return jsonResponse(
      {
        message: "Avatar uploaded successfully",
        avatarUrl: blob.url,
        user,
      },
      200,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload avatar";
    return errorResponse(message, 500);
  }
}