import { DocumentModal } from "@/components/DocumentModal";
import { FileTypeIcon } from "@/components/FileTypeIcon";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Document, Employee } from "@/hooks/useQueries";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_STATUSES,
  formatDate,
  getAvatarColor,
  getInitials,
} from "@/lib/helpers";
import {
  ChevronDown,
  Eye,
  FileX,
  LayoutGrid,
  List,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface DocumentsProps {
  employees: Employee[];
  documents: Document[];
  isLoading: boolean;
  filterEmployeeId?: bigint | null;
  onStatusChange: (docId: bigint, status: string) => Promise<void>;
  onDelete: (docId: bigint) => Promise<void>;
}

type ViewMode = "table" | "card";

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

export function Documents({
  employees,
  documents,
  isLoading,
  filterEmployeeId,
  onStatusChange,
  onDelete,
}: DocumentsProps) {
  const [search, setSearch] = useState("");
  const [filterWorkName, setFilterWorkName] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const getEmployee = useCallback(
    (id: bigint) => employees.find((e) => e.id === id),
    [employees],
  );

  const filteredEmployeeObj = filterEmployeeId
    ? employees.find((e) => e.id === filterEmployeeId)
    : null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return documents.filter((doc) => {
      const emp = employees.find((e) => e.id === doc.employeeId);
      if (filterEmployeeId && doc.employeeId !== filterEmployeeId) return false;
      if (filterWorkName !== "all" && emp?.workName !== filterWorkName)
        return false;
      if (filterCategory !== "all" && doc.category !== filterCategory)
        return false;
      if (filterStatus !== "all" && doc.status !== filterStatus) return false;
      if (q) {
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesCategory = doc.category.toLowerCase().includes(q);
        const matchesEmployee = emp?.name.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesCategory && !matchesEmployee) return false;
      }
      return true;
    });
  }, [
    documents,
    employees,
    search,
    filterWorkName,
    filterCategory,
    filterStatus,
    filterEmployeeId,
  ]);

  const selectedEmployee = selectedDoc
    ? getEmployee(selectedDoc.employeeId)
    : undefined;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">
          {filteredEmployeeObj
            ? `${filteredEmployeeObj.name}'s Documents`
            : "Documents"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isLoading
            ? "Loading..."
            : `${filtered.length} document${filtered.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {!filterEmployeeId && (
            <Select value={filterWorkName} onValueChange={setFilterWorkName}>
              <SelectTrigger className="w-40 text-sm">
                <SelectValue placeholder="Work Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Work Names</SelectItem>
                {[...new Set(employees.map((e) => e.workName))]
                  .sort()
                  .map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-36 text-sm">
              <ChevronDown className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {DOCUMENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {DOCUMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 transition-colors ${
                viewMode === "card"
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {SKELETON_KEYS.map((k) => (
                <div key={k} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                  <Skeleton className="h-4 flex-1 max-w-[180px]" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <FileX className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold">No documents found</p>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : viewMode === "table" ? (
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-600 py-3">
                    Employee
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600 py-3">
                    Document
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600 py-3">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600 py-3">
                    Type
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600 py-3">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600 py-3">
                    Upload Date
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600 py-3">
                    Expiry
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600 py-3 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => {
                  const emp = getEmployee(doc.employeeId);
                  const avatarColor = emp
                    ? getAvatarColor(emp.name)
                    : "from-slate-400 to-slate-500";
                  return (
                    <TableRow
                      key={doc.id.toString()}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                          >
                            {emp ? getInitials(emp.name) : "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                              {emp?.name ?? "Unknown"}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {emp?.workName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <p className="text-sm font-medium text-slate-700 max-w-[180px] truncate">
                          {doc.title}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-sm text-slate-600 whitespace-nowrap">
                          {doc.category}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <FileTypeIcon
                          fileType={doc.fileType}
                          className="w-7 h-7"
                          size={14}
                        />
                      </TableCell>
                      <TableCell className="py-3">
                        <StatusBadge status={doc.status} />
                      </TableCell>
                      <TableCell className="py-3 text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(doc.uploadDate)}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(doc.expiryDate)}
                      </TableCell>
                      <TableCell
                        className="py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-blue-600"
                            onClick={() => setSelectedDoc(doc)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                            onClick={async () => {
                              await onDelete(doc.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const emp = getEmployee(doc.employeeId);
            const avatarColor = emp
              ? getAvatarColor(emp.name)
              : "from-slate-400 to-slate-500";
            return (
              <Card
                key={doc.id.toString()}
                className="shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedDoc(doc)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <FileTypeIcon
                      fileType={doc.fileType}
                      className="w-10 h-10 flex-shrink-0"
                      size={20}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 line-clamp-2 leading-snug">
                        {doc.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {doc.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-6 h-6 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}
                    >
                      {emp ? getInitials(emp.name) : "?"}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {emp?.name ?? "Unknown"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <StatusBadge status={doc.status} />
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Uploaded</p>
                      <p className="text-xs font-medium text-slate-600">
                        {formatDate(doc.uploadDate)}
                      </p>
                    </div>
                  </div>

                  {doc.expiryDate && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-slate-400">
                        Expires:{" "}
                        <span className="text-slate-600 font-medium">
                          {formatDate(doc.expiryDate)}
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Document Modal */}
      <DocumentModal
        document={selectedDoc}
        employee={selectedEmployee}
        onClose={() => setSelectedDoc(null)}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    </div>
  );
}
