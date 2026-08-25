import { reportService } from "@/modules/reports";

async function main() {
  await reportService.refreshReportSummary();
  console.log("Report summary refreshed successfully");
}

main().catch((error) => {
  console.error("Failed to refresh report summary", error);
  process.exit(1);
});