import {
  expireInactiveLawyers,
} from "@/modules/lawyers/public-service";

export async function runLawyerAvailabilityJob() {
  const updated = await expireInactiveLawyers();

  console.log(
    `[LAWYER AVAILABILITY] Marked ${updated} stale lawyers offline`,
  );

  return updated;
}
