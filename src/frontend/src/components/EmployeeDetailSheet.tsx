import { FileTypeIcon } from "@/components/FileTypeIcon";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Document, Employee } from "@/hooks/useQueries";
import {
  formatDate,
  getAvatarColor,
  getInitials,
  getWorkNameColor,
  maskAadhaar,
  normalizeEmploymentStatus,
} from "@/lib/helpers";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  MapPin,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface EmployeeDetailSheetProps {
  employee: Employee | null;
  documents: Document[];
  onClose: () => void;
  onViewAllDocs: (employeeId: bigint) => void;
  onToggleStatus: (employeeId: bigint, newStatus: string) => Promise<void>;
  onDeleteDocument: (docId: bigint) => Promise<void>;
}

export function EmployeeDetailSheet({
  employee,
  documents,
  onClose,
  onViewAllDocs,
  onToggleStatus,
  onDeleteDocument,
}: EmployeeDetailSheetProps) {
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<bigint | null>(null);

  if (!employee) return null;

  const empDocs = documents.filter((d) => d.employeeId === employee.id);
  const avatarColor = getAvatarColor(employee.name);
  const normalizedStatus = normalizeEmploymentStatus(employee.employmentStatus);
  const isWorking = normalizedStatus === "Working";
  const workNameColor = getWorkNameColor(employee.workName);

  async function handleToggleStatus() {
    const newStatus = isWorking ? "Left" : "Working";
    setIsTogglingStatus(true);
    try {
      await onToggleStatus(employee!.id, newStatus);
    } finally {
      setIsTogglingStatus(false);
    }
  }

  async function handleDeleteDoc(docId: bigint) {
    setDeletingDocId(docId);
    try {
      await onDeleteDocument(docId);
    } finally {
      setDeletingDocId(null);
    }
  }

  return (
    <Sheet open={!!employee} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 px-6 py-6">
          <SheetHeader className="mb-0">
            <SheetTitle className="sr-only">Employee Details</SheetTitle>
          </SheetHeader>

          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xl font-bold border-2 border-white/20`}
              >
                {employee.photo ? (
                  <img
                    src={employee.photo}
                    alt={employee.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  getInitials(employee.name)
                )}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-slate-800 ${
                  isWorking ? "bg-emerald-400" : "bg-slate-400"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-display font-bold text-lg leading-tight truncate">
                {employee.name}
              </h2>
              <p className="text-slate-300 text-sm mt-0.5">
                {employee.designation}
              </p>
              {employee.email && (
                <p className="text-slate-400 text-xs mt-0.5 truncate">
                  {employee.email}
                </p>
              )}
            </div>
          </div>

          {/* Status badge + toggle */}
          <div className="flex items-center gap-3 mt-4">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isWorking
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-slate-600 text-slate-300 border border-slate-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isWorking ? "bg-emerald-400" : "bg-slate-400"}`}
              />
              {isWorking ? "Working" : "Left"}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className="h-7 text-xs border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
            >
              {isTogglingStatus ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : null}
              Mark as {isWorking ? "Left" : "Working"}
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  Work Name
                </p>
              </div>
              <span
                className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${workNameColor}`}
              >
                {employee.workName}
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  Work Site
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {employee.workSite}
              </p>
            </div>
          </div>

          {/* Aadhaar */}
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                Aadhaar Number
              </p>
              <button
                type="button"
                onClick={() => setShowAadhaar((v) => !v)}
                className="p-1 rounded hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
                title={showAadhaar ? "Hide" : "Show"}
              >
                {showAadhaar ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-sm font-mono font-semibold text-slate-700 tracking-widest">
              {showAadhaar
                ? employee.aadhaarNumber
                : maskAadhaar(employee.aadhaarNumber)}
            </p>
          </div>

          {/* Documents section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-700">
                  Documents
                  <span className="ml-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                    {empDocs.length}
                  </span>
                </h3>
              </div>
              {empDocs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary hover:text-primary/80 -mr-2 h-7"
                  onClick={() => {
                    onViewAllDocs(employee.id);
                    onClose();
                  }}
                >
                  View All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>

            {empDocs.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-lg">
                <FileText className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-sm text-slate-400">No documents yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {empDocs.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id.toString()}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group/doc"
                  >
                    <FileTypeIcon
                      fileType={doc.fileType}
                      className="w-8 h-8 flex-shrink-0"
                      size={16}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {doc.category} · {formatDate(doc.uploadDate)}
                      </p>
                    </div>
                    <StatusBadge status={doc.status} />
                    <button
                      type="button"
                      onClick={() => handleDeleteDoc(doc.id)}
                      disabled={deletingDocId === doc.id}
                      className="ml-1 p-1 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover/doc:opacity-100 flex-shrink-0"
                      title="Delete document"
                    >
                      {deletingDocId === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
                {empDocs.length > 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      onViewAllDocs(employee.id);
                      onClose();
                    }}
                    className="w-full text-center text-xs text-primary font-medium py-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    +{empDocs.length - 5} more documents
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
