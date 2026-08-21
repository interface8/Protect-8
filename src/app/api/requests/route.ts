import { NextRequest } from "next/server";
import {
  createRequestSchema,
  requestFiltersSchema,
  requestService,
} from "@/modules/requests";
import { requireApiRole, isErrorResponse } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";

export async function GET(request: NextRequest) {
  const guard = await requireApiRole(["citizen", "lawyer", "admin"]);
  if (isErrorResponse(guard)) return guard;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  const parsed = requestFiltersSchema.safeParse({
    ...searchParams,
    status: searchParams.status || undefined,
    page: searchParams.page || undefined,
    limit: searchParams.limit || undefined,
  });

  if (!parsed.success) {
    return Response.json(
      {
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const filters = { ...parsed.data };

  if (guard.role === "citizen") {
    filters.citizenId = guard.id;
  }

  if (guard.role === "lawyer") {
    filters.lawyerId = guard.id;
  }

  try {
    const result = await requestService.listRequests(filters);
    return jsonResponse(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch requests";
    return errorResponse(message, 500);
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireApiRole(["citizen"]);
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const parsed = createRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const created = await requestService.createRequest({
      ...parsed.data,
      citizenId: guard.id,
    });

    return jsonResponse(created, 201);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create request";
    return errorResponse(message, 500);
  }
}