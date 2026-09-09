import { NextRequest } from "next/server";
import {
  runLawyerAvailabilityJob,
} from "@/jobs/lawyer-availability";
import { errorResponse, jsonResponse } from "@/lib/http";

function isAuthorized(request: NextRequest) {
  const secret = process.env.LAWYER_AVAILABILITY_CRON_SECRET;
  const authorization = request.headers.get("authorization");

  return Boolean(
    secret && authorization === `Bearer ${secret}`,
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const updated = await runLawyerAvailabilityJob();

    return jsonResponse({
      message: "Lawyer availability cleanup completed",
      updated,
    });
  } catch (error) {
    console.error("Lawyer availability job failed", error);
    return errorResponse(
      "Availability cleanup failed",
      500,
    );
  }
}
