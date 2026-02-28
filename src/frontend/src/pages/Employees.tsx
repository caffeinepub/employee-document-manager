import { AddEmployeeModal } from "@/components/AddEmployeeModal";
import { EditEmployeeModal } from "@/components/EditEmployeeModal";
import { EmployeeDetailSheet } from "@/components/EmployeeDetailSheet";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document, Employee } from "@/hooks/useQueries";
import {
  getAvatarColor,
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
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

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
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        e.workName.toLowerCase().includes(q) ||
        e.workSite.toLowerCase().includes(q)
      );
    });
  }, [normalizedEmployees, search, statusFilter, workNameFilter]);

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
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setWorkNameFilter(null)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                workNameFilter === null
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              All Groups
            </button>
            {workNameGroups.map(([name, count]) => {
              const colorClass = getWorkNameColor(name);
              const isActive = workNameFilter === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setWorkNameFilter(isActive ? null : name)}
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
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No employees found</p>
          <p className="text-sm text-slate-400 mt-1">
            Try a different search term or filter
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
                    <p className="text-xs text-slate-500 mt-0.5">
                      {emp.designation}
                    </p>
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
