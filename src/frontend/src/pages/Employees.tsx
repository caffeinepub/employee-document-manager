import { AddEmployeeModal } from "@/components/AddEmployeeModal";
import { EditEmployeeModal } from "@/components/EditEmployeeModal";
import { EmployeeDetailSheet } from "@/components/EmployeeDetailSheet";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document, Employee } from "@/hooks/useQueries";
import {
  getAvatarColor,
  getDesignationColor,
  getInitials,
  getWorkNameColor,
  normalizeEmploymentStatus,
} from "@/lib/helpers";
import {
  Building2,
  ChevronRight,
  FileText,
  MapPin,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

interface EmployeesProps {
  employees: Employee[];
  documents: Document[];
  isLoading: boolean;
  onViewEmployeeDocs: (employeeId: bigint) => void;
  onAddEmployee: (emp: Omit<Employee, "id">) => Promise<void>;
  onToggleEmployeeStatus: (
    employeeId: bigint,
    newStatus: string,
  ) => Promise<void>;
  onDeleteDocument: (docId: bigint) => Promise<void>;
  onEditEmployee: (
    employeeId: bigint,
    data: Omit<Employee, "id">,
  ) => Promise<void>;
  onDeleteEmployee: (employeeId: bigint) => Promise<void>;
}

type StatusFilter = "All" | "Working" | "Left";

export function Employees({
  employees,
  documents,
  isLoading,
  onViewEmployeeDocs,
  onAddEmployee,
  onToggleEmployeeStatus,
  onDeleteDocument,
  onEditEmployee,
  onDeleteEmployee,
}: EmployeesProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [workNameFilter, setWorkNameFilter] = useState<string | null>(null);
  const [siteFilter, setSiteFilter] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleWorkNameFilter = (name: string | null) => {
    setWorkNameFilter(name);
    setSiteFilter(null);
  };

  // Normalize status: "Active" -> "Working"
  const normalizedEmployees = useMemo(
    () =>
      employees.map((e) => ({
        ...e,
        employmentStatus: normalizeEmploymentStatus(e.employmentStatus),
      })),
    [employees],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return normalizedEmployees.filter((e) => {
      const matchesStatus =
        statusFilter === "All" || e.employmentStatus === statusFilter;
      if (!matchesStatus) return false;
      if (workNameFilter && e.workName !== workNameFilter) return false;
      if (siteFilter && e.workSite !== siteFilter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        e.workName.toLowerCase().includes(q) ||
        e.workSite.toLowerCase().includes(q)
      );
    });
  }, [normalizedEmployees, search, statusFilter, workNameFilter, siteFilter]);

  const getDocCount = (id: bigint) =>
    documents.filter((d) => d.employeeId === id).length;

  const workingCount = normalizedEmployees.filter(
    (e) => e.employmentStatus === "Working",
  ).length;
  const leftCount = normalizedEmployees.filter(
    (e) => e.employmentStatus === "Left",
  ).length;

  // Work name groups
  const workNameGroups = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of normalizedEmployees) {
      map.set(e.workName, (map.get(e.workName) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [normalizedEmployees]);

  // Sites per work group with employee counts (based on filtered employees when a work group is active)
  const workNameSites = useMemo(() => {
    // For counting, use all normalized employees (not filtered by search/status) so counts reflect real totals per work group
    const siteCountMap = new Map<string, Map<string, number>>();
    for (const e of normalizedEmployees) {
      if (!siteCountMap.has(e.workName))
        siteCountMap.set(e.workName, new Map());
      const siteMap = siteCountMap.get(e.workName)!;
      const site = e.workSite || "";
      siteMap.set(site, (siteMap.get(site) ?? 0) + 1);
    }
    // Also collect all sites per work group (including those with 0 employees if needed)
    const result = new Map<string, { site: string; count: number }[]>();
    for (const [workName, siteMap] of siteCountMap) {
      const sites = [...siteMap.entries()]
        .filter(([site]) => site.trim() !== "")
        .map(([site, count]) => ({ site, count }))
        .sort((a, b) => a.site.localeCompare(b.site));
      result.set(workName, sites);
    }
    return result;
  }, [normalizedEmployees]);

  const STATUS_TABS: { label: StatusFilter; count: number }[] = [
    { label: "All", count: normalizedEmployees.length },
    { label: "Working", count: workingCount },
    { label: "Left", count: leftCount },
  ];

  // Find the current selected employee from normalized list (with updated status)
  const selectedNormalized = selectedEmployee
    ? (normalizedEmployees.find((e) => e.id === selectedEmployee.id) ?? null)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">
            Employees
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                <span className="font-semibold text-slate-700">
                  {normalizedEmployees.length}
                </span>{" "}
                employees across{" "}
                <span className="font-semibold text-slate-700">
                  {workNameGroups.length}
                </span>{" "}
                work groups
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {STATUS_TABS.map(({ label, count }) => (
          <button
            key={label}
            type="button"
            onClick={() => setStatusFilter(label)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              statusFilter === label
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label === "Working" && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            )}
            {label === "Left" && (
              <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
            )}
            {label === "All" && <Users className="w-3.5 h-3.5 flex-shrink-0" />}
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                statusFilter === label
                  ? "bg-slate-100 text-slate-600"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Work name chips */}
      {workNameGroups.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Work Groups
          </p>
          <div className="flex flex-wrap gap-3 items-start">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleWorkNameFilter(null)}
                data-ocid="employees.all_groups.button"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                  workNameFilter === null
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                All Groups
              </button>
            </div>
            {workNameGroups.map(([name, count]) => {
              const colorClass = getWorkNameColor(name);
              const isActive = workNameFilter === name;
              const sites = workNameSites.get(name) ?? [];
              return (
                <div key={name} className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleWorkNameFilter(isActive ? null : name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                      isActive
                        ? `ring-2 ring-offset-1 ring-slate-400 ${colorClass}`
                        : `${colorClass} border-transparent hover:border-current/30`
                    }`}
                  >
                    <Building2 className="w-3 h-3" />
                    {name}
                    <span className="bg-black/10 px-1 py-0.5 rounded text-[10px] font-bold">
                      {count}
                    </span>
                  </button>
                  {isActive && sites.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-1 items-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide self-center mr-0.5">
                        Sites:
                      </span>
                      {/* All Sites pill */}
                      <button
                        key="all-sites"
                        type="button"
                        onClick={() => setSiteFilter(null)}
                        data-ocid="employees.all_sites.button"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150 ${
                          siteFilter === null
                            ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20"
                            : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary"
                        }`}
                      >
                        All Sites
                      </button>
                      {/* Individual site pills */}
                      {sites.map(({ site, count: siteCount }, index) => (
                        <button
                          key={site}
                          type="button"
                          onClick={() => setSiteFilter(site)}
                          data-ocid={`employees.site_filter.button.${index + 1}`}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150 ${
                            siteFilter === site
                              ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20"
                              : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary"
                          }`}
                        >
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                          {site}
                          <span
                            className={`ml-0.5 px-1.5 py-0 rounded-full text-[9px] font-bold leading-4 min-w-[16px] text-center ${
                              siteFilter === site
                                ? "bg-white/20 text-white"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {siteCount}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name, designation, work name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8"].map((k) => (
            <Card key={k} className="shadow-card">
              <CardContent className="p-5">
                <Skeleton className="w-12 h-12 rounded-full mb-3" />
                <Skeleton className="h-5 w-36 mb-1.5" />
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-5 w-20 rounded-full mb-3" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" data-ocid="employees.empty_state">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            {siteFilter ? (
              <MapPin className="w-5 h-5 text-slate-400" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <p className="text-slate-500 font-medium">
            {siteFilter
              ? "No employees found in this site."
              : "No employees found"}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {siteFilter
              ? `No employees are assigned to "${siteFilter}"`
              : "Try a different search term or filter"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((emp) => {
            const avatarColor = getAvatarColor(emp.name);
            const docCount = getDocCount(emp.id);
            const isLeft = emp.employmentStatus === "Left";
            const workNameColor = getWorkNameColor(emp.workName);
            return (
              <Card
                key={emp.id.toString()}
                className={`shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer group ${isLeft ? "opacity-60" : ""}`}
                onClick={() => setSelectedEmployee(emp)}
              >
                <CardContent className="p-5">
                  {/* Avatar + status badge row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-base font-bold`}
                      >
                        {getInitials(emp.name)}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          isLeft ? "bg-slate-400" : "bg-emerald-500"
                        }`}
                        title={emp.employmentStatus}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isLeft
                            ? "bg-slate-100 text-slate-500"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isLeft ? "bg-slate-400" : "bg-emerald-500"}`}
                        />
                        {emp.employmentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-display font-semibold text-slate-800 leading-tight">
                      {emp.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mt-1 ${getDesignationColor(emp.designation)}`}
                    >
                      {emp.designation}
                    </span>
                  </div>

                  {/* Work name badge */}
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${workNameColor}`}
                    >
                      <Building2 className="w-2.5 h-2.5" />
                      {emp.workName}
                    </span>
                  </div>

                  {/* Work site */}
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{emp.workSite}</span>
                  </div>

                  {/* Doc count */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <FileText className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <span>
                        {docCount} doc{docCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Employee Detail Sheet */}
      <EmployeeDetailSheet
        employee={selectedNormalized}
        documents={documents}
        onClose={() => setSelectedEmployee(null)}
        onViewAllDocs={onViewEmployeeDocs}
        onToggleStatus={onToggleEmployeeStatus}
        onDeleteDocument={onDeleteDocument}
        onEditEmployee={(emp) => {
          setSelectedEmployee(null);
          setEditingEmployee(emp);
        }}
        onDeleteEmployee={onDeleteEmployee}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddEmployee={onAddEmployee}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        open={!!editingEmployee}
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onUpdateEmployee={onEditEmployee}
      />
    </div>
  );
}
