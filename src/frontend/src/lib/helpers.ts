export const DOCUMENT_CATEGORIES = [
  "ID Proof",
  "Aadhaar Card",
  "Bank Details",
  "Employee Photo",
  "Offer Letter",
  "Contract",
  "Payslip",
  "Performance Review",
  "Certificate",
  "Tax Form",
  "Other",
] as const;

export const DOCUMENT_STATUSES = [
  "Pending",
  "Approved",
  "Active",
  "Expired",
] as const;

export const DEPARTMENTS = [
  "HR",
  "Engineering",
  "Finance",
  "Marketing",
] as const;

export const WORK_NAMES = [
  "Acme Construction",
  "Bridge Works",
  "Road Division",
] as const;

export const WORK_SITES = ["Site A", "Site B", "North Zone"] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isRecentUpload(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return diff <= 7 * 24 * 60 * 60 * 1000;
}

export function getDepartmentColor(dept: string): string {
  const map: Record<string, string> = {
    HR: "bg-violet-100 text-violet-700",
    Engineering: "bg-blue-100 text-blue-700",
    Finance: "bg-emerald-100 text-emerald-700",
    Marketing: "bg-orange-100 text-orange-700",
  };
  return map[dept] ?? "bg-slate-100 text-slate-700";
}

export function getWorkNameColor(workName: string): string {
  const map: Record<string, string> = {
    "Acme Construction": "bg-blue-100 text-blue-700",
    "Bridge Works": "bg-amber-100 text-amber-700",
    "Road Division": "bg-teal-100 text-teal-700",
  };
  // Generate a color for any work name not in the map
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-rose-100 text-rose-700",
    "bg-indigo-100 text-indigo-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
    "bg-cyan-100 text-cyan-700",
  ];
  if (map[workName]) return map[workName];
  let hash = 0;
  for (let i = 0; i < workName.length; i++) {
    hash = workName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar) return "—";
  // Keep only the last 4 digits visible
  const parts = aadhaar.split("-");
  return parts
    .map((part, i) => (i === parts.length - 1 ? part : "XXXX"))
    .join("-");
}

export function normalizeEmploymentStatus(status: string): "Working" | "Left" {
  if (status === "Left") return "Left";
  return "Working"; // "Working" and "Active" both treated as Working
}

export function getAvatarColor(name: string): string {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-violet-500 to-violet-600",
    "from-emerald-500 to-emerald-600",
    "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600",
    "from-cyan-500 to-cyan-600",
    "from-indigo-500 to-indigo-600",
    "from-pink-500 to-pink-600",
    "from-teal-500 to-teal-600",
    "from-orange-500 to-orange-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getStatusConfig(status: string): {
  label: string;
  className: string;
} {
  const map: Record<string, { label: string; className: string }> = {
    Pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border border-amber-200",
    },
    Approved: {
      label: "Approved",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    Active: {
      label: "Active",
      className: "bg-blue-50 text-blue-700 border border-blue-200",
    },
    Expired: {
      label: "Expired",
      className: "bg-rose-50 text-rose-700 border border-rose-200",
    },
  };
  return (
    map[status] ?? { label: status, className: "bg-slate-100 text-slate-600" }
  );
}

export function getNextStatus(current: string): string {
  const cycle: Record<string, string> = {
    Pending: "Approved",
    Approved: "Active",
    Active: "Expired",
    Expired: "Pending",
  };
  return cycle[current] ?? "Pending";
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
