import { StatusBadge } from "@/components/StatusBadge";
import { WorkWiseFullReportPanel } from "@/components/WorkWiseFullReportPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document, Employee } from "@/hooks/useQueries";
import {
  getAvatarColor,
  getDesignationColor,
  getInitials,
  isRecentUpload,
  normalizeEmploymentStatus,
} from "@/lib/helpers";
import { generateWorkWiseReport } from "@/lib/reportGenerator";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Loader2,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

interface DashboardProps {
  employees: Employee[];
  documents: Document[];
  isLoading: boolean;
  onNavigate: (page: "employees" | "documents" | "upload") => void;
}

export function Dashboard({
  employees,
  documents,
  isLoading,
  onNavigate,
}: DashboardProps) {
  const [summaryWorkGroupFilter, setSummaryWorkGroupFilter] = useState<
    string | null
  >(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Normalize statuses for summary
  const normalizedEmployees = useMemo(
    () =>
      employees.map((e) => ({
        ...e,
        employmentStatus: normalizeEmploymentStatus(e.employmentStatus),
      })),
    [employees],
  );

  // Employees filtered by the summary work group filter
  const summaryEmployees = useMemo(() => {
    if (!summaryWorkGroupFilter) return normalizedEmployees;
    return normalizedEmployees.filter(
      (e) => e.workName === summaryWorkGroupFilter,
    );
  }, [normalizedEmployees, summaryWorkGroupFilter]);

  // Designation breakdown from summaryEmployees
  const designationSummary = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of summaryEmployees) {
      const d = e.designation || "Other";
      map.set(d, (map.get(d) ?? 0) + 1);
    }
    // Sort: known designations first, then alphabetical
    const priority = ["Manager", "Supervisor", "Staff", "Security"];
    return [...map.entries()].sort(([a], [b]) => {
      const ai = priority.findIndex((p) => p.toLowerCase() === a.toLowerCase());
      const bi = priority.findIndex((p) => p.toLowerCase() === b.toLowerCase());
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [summaryEmployees]);

  // Work group list for the filter chips in summary
  const summaryWorkGroups = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of normalizedEmployees) {
      map.set(e.workName, (map.get(e.workName) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [normalizedEmployees]);

  const stats = useMemo(() => {
    const recentUploads = documents.filter((d) =>
      isRecentUpload(d.uploadDate),
    ).length;
    const pendingReviews = documents.filter(
      (d) => d.status === "Pending",
    ).length;
    return {
      totalDocuments: documents.length,
      totalEmployees: employees.length,
      recentUploads,
      pendingReviews,
    };
  }, [documents, employees]);

  const recentActivity = useMemo(() => {
    return [...documents]
      .sort((a, b) => b.uploadDate.localeCompare(a.uploadDate))
      .slice(0, 8);
  }, [documents]);

  const getEmployee = (id: bigint) => employees.find((e) => e.id === id);

  const statCards = [
    {
      label: "Total Documents",
      value: stats.totalDocuments,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: "+12 this month",
    },
    {
      label: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
      trend: "Across all work groups",
    },
    {
      label: "Recent Uploads",
      value: stats.recentUploads,
      icon: Upload,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "Last 7 days",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: "Requires attention",
    },
  ];

  const SKELETON_STAT_KEYS = ["s1", "s2", "s3", "s4"];
  const SKELETON_ACTIVITY_KEYS = ["a1", "a2", "a3", "a4", "a5"];
  const SKELETON_DEPT_KEYS = ["d1", "d2", "d3", "d4"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isDownloading || employees.length === 0}
          data-ocid="dashboard.download_report_button"
          className="flex-shrink-0 gap-2 border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
          onClick={async () => {
            setIsDownloading(true);
            try {
              generateWorkWiseReport(employees);
            } finally {
              setIsDownloading(false);
            }
          }}
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isDownloading ? "Generating…" : "Download Work-wise Report"}
          </span>
          <span className="sm:hidden">{isDownloading ? "…" : "Report"}</span>
        </Button>
      </div>

      {/* Work-wise Full Report Panel */}
      <WorkWiseFullReportPanel employees={employees} />

      {/* Employee Summary by Designation */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">
              Employee Summary
            </h2>
            <p className="text-xs text-slate-400">
              Grouped by designation
              {summaryWorkGroupFilter
                ? ` · ${summaryWorkGroupFilter}`
                : " · All Work Groups"}
            </p>
          </div>
          {/* Work group filter chips */}
          {!isLoading && summaryWorkGroups.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:ml-auto">
              <button
                type="button"
                onClick={() => setSummaryWorkGroupFilter(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                  summaryWorkGroupFilter === null
                    ? "bg-slate-700 text-white border-slate-700"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                }`}
              >
                All
              </button>
              {summaryWorkGroups.map(([name]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() =>
                    setSummaryWorkGroupFilter(
                      summaryWorkGroupFilter === name ? null : name,
                    )
                  }
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                    summaryWorkGroupFilter === name
                      ? "bg-slate-700 text-white border-slate-700"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="flex flex-wrap gap-3">
          {isLoading ? (
            ["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
              <div
                key={k}
                className="flex-shrink-0 w-36 rounded-xl border border-border bg-white shadow-sm p-4"
              >
                <Skeleton className="h-5 w-16 mb-2 rounded-full" />
                <Skeleton className="h-8 w-10 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))
          ) : (
            <>
              {/* Total card */}
              <div className="flex-shrink-0 min-w-[128px] rounded-xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 w-fit">
                  Total
                </span>
                <p className="text-3xl font-display font-bold text-slate-800 leading-none mt-1">
                  {summaryEmployees.length}
                </p>
                <p className="text-xs text-slate-400">Employees</p>
              </div>

              {/* Per-designation cards */}
              {designationSummary.map(([designation, count]) => (
                <div
                  key={designation}
                  className="flex-shrink-0 min-w-[128px] rounded-xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col gap-1.5"
                >
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold w-fit ${getDesignationColor(designation)}`}
                  >
                    {designation}
                  </span>
                  <p className="text-3xl font-display font-bold text-slate-800 leading-none mt-1">
                    {count}
                  </p>
                  <p className="text-xs text-slate-400">
                    {count === 1 ? "Employee" : "Employees"}
                  </p>
                </div>
              ))}

              {designationSummary.length === 0 && (
                <div className="flex items-center justify-center w-full py-8 text-sm text-slate-400">
                  No employees found
                  {summaryWorkGroupFilter
                    ? ` in "${summaryWorkGroupFilter}"`
                    : ""}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? SKELETON_STAT_KEYS.map((k) => (
              <Card key={k} className="shadow-card">
                <CardContent className="p-5">
                  <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                  <Skeleton className="h-7 w-16 mb-1" />
                  <Skeleton className="h-4 w-28" />
                </CardContent>
              </Card>
            ))
          : statCards.map(({ label, value, icon: Icon, color, bg, trend }) => (
              <Card
                key={label}
                className="shadow-card hover:shadow-card-hover transition-shadow duration-200"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-display font-bold text-slate-800">
                      {value}
                    </p>
                    <p className="text-sm font-medium text-slate-600 mt-0.5">
                      {label}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{trend}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="font-display font-semibold text-slate-800">
                  Recent Activity
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest document uploads and updates
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 hover:text-blue-700 -mr-2"
                onClick={() => onNavigate("documents")}
              >
                View all <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="divide-y divide-border">
                  {SKELETON_ACTIVITY_KEYS.map((k) => (
                    <div
                      key={k}
                      className="flex items-center gap-3 px-5 py-3.5"
                    >
                      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded" />
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No documents yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentActivity.map((doc) => {
                    const emp = getEmployee(doc.employeeId);
                    const avatarColor = emp
                      ? getAvatarColor(emp.name)
                      : "from-slate-400 to-slate-500";
                    return (
                      <div
                        key={doc.id.toString()}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                        >
                          {emp ? getInitials(emp.name) : "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {doc.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {emp?.workName}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <StatusBadge status={doc.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="shadow-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-slate-800">
                Quick Actions
              </h2>
            </div>
            <CardContent className="p-4 space-y-2.5">
              <button
                type="button"
                onClick={() => onNavigate("upload")}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-blue-300 hover:bg-blue-50 transition-all duration-150 group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Upload
                    className="w-4.5 h-4.5 text-blue-600"
                    style={{ width: 18, height: 18 }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-700">
                    Upload Document
                  </p>
                  <p className="text-xs text-slate-400">Add a new document</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("employees")}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-violet-300 hover:bg-violet-50 transition-all duration-150 group"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Users
                    className="w-4.5 h-4.5 text-violet-600"
                    style={{ width: 18, height: 18 }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-700">
                    View All Employees
                  </p>
                  <p className="text-xs text-slate-400">
                    {stats.totalEmployees} employees
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("documents")}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-150 group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <FileText
                    className="w-4.5 h-4.5 text-emerald-600"
                    style={{ width: 18, height: 18 }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-700">
                    Browse Documents
                  </p>
                  <p className="text-xs text-slate-400">
                    {stats.totalDocuments} total docs
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </button>
            </CardContent>
          </Card>

          {/* Work Group Breakdown */}
          <Card className="shadow-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-slate-800">
                Work Groups
              </h2>
            </div>
            <CardContent className="p-4 space-y-2">
              {isLoading
                ? SKELETON_DEPT_KEYS.map((k) => (
                    <div key={k} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))
                : (() => {
                    const workNameMap = new Map<string, number>();
                    for (const e of employees) {
                      workNameMap.set(
                        e.workName,
                        (workNameMap.get(e.workName) ?? 0) + 1,
                      );
                    }
                    const workNameColors = [
                      "bg-blue-500",
                      "bg-amber-500",
                      "bg-teal-500",
                      "bg-violet-500",
                      "bg-rose-500",
                      "bg-indigo-500",
                    ];
                    return [...workNameMap.entries()].map(
                      ([name, count], idx) => (
                        <div key={name} className="flex items-center gap-2.5">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${workNameColors[idx % workNameColors.length]}`}
                          />
                          <span className="text-sm text-slate-600 flex-1 truncate">
                            {name}
                          </span>
                          <span className="text-sm font-semibold text-slate-700">
                            {count}
                          </span>
                        </div>
                      ),
                    );
                  })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
