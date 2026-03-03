import { normalizeEmploymentStatus } from "./helpers";

type EmployeeLike = {
  workName: string;
  designation: string;
  workSite: string;
  employmentStatus: string;
};

// Helper: Convert array-of-arrays to CSV string
function toCSV(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const val = String(cell ?? "");
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(","),
    )
    .join("\n");
}

// Helper: Download a text file
function downloadText(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function generateWorkWiseReport(employees: EmployeeLike[]): void {
  // Normalize statuses
  const normalized = employees.map((e) => ({
    ...e,
    employmentStatus: normalizeEmploymentStatus(e.employmentStatus),
  }));

  // ── Sheet 1: Work Group Summary ──────────────────────────────────────────
  const workGroupMap = new Map<
    string,
    { total: number; working: number; left: number }
  >();
  for (const e of normalized) {
    const wg = e.workName || "Unknown";
    const existing = workGroupMap.get(wg) ?? { total: 0, working: 0, left: 0 };
    existing.total++;
    if (e.employmentStatus === "Working") existing.working++;
    else existing.left++;
    workGroupMap.set(wg, existing);
  }
  const sheet1Data: (string | number)[][] = [
    ["Work Group Name", "Total Employees", "Working Count", "Left Count"],
    ...[...workGroupMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, counts]) => [
        name,
        counts.total,
        counts.working,
        counts.left,
      ]),
  ];

  // ── Sheet 2: Work Group + Designation Summary ────────────────────────────
  const designMap = new Map<string, number>();
  for (const e of normalized) {
    const key = `${e.workName || "Unknown"}||${e.designation || "Unknown"}`;
    designMap.set(key, (designMap.get(key) ?? 0) + 1);
  }
  const sheet2Data: (string | number)[][] = [
    ["Work Group", "Designation", "Employee Count"],
    ...[...designMap.entries()].sort().map(([key, count]) => {
      const [wg, desig] = key.split("||");
      return [wg, desig, count];
    }),
  ];

  // ── Sheet 3: Work Group + Site Summary ──────────────────────────────────
  const siteMap = new Map<string, number>();
  for (const e of normalized) {
    const key = `${e.workName || "Unknown"}||${e.workSite || "Unknown"}`;
    siteMap.set(key, (siteMap.get(key) ?? 0) + 1);
  }
  const sheet3Data: (string | number)[][] = [
    ["Work Group", "Site Name", "Employee Count"],
    ...[...siteMap.entries()].sort().map(([key, count]) => {
      const [wg, site] = key.split("||");
      return [wg, site, count];
    }),
  ];

  // ── File name: Work_Wise_Employee_Report_YYYY_MM_DD.csv ──────────────────
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  // Combine all sheets into one CSV with section headers
  const combined = [
    "=== SHEET 1: Work Group Summary ===",
    toCSV(sheet1Data),
    "",
    "=== SHEET 2: Work Group + Designation Summary ===",
    toCSV(sheet2Data),
    "",
    "=== SHEET 3: Work Group + Site Summary ===",
    toCSV(sheet3Data),
  ].join("\n");

  const fileName = `Work_Wise_Employee_Report_${yyyy}_${mm}_${dd}.csv`;
  downloadText(combined, fileName, "text/csv;charset=utf-8;");
}
