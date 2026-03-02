import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Document, Employee } from "@/hooks/useQueries";
import {
  DOCUMENT_STATUSES,
  formatDate,
  getAvatarColor,
  getInitials,
} from "@/lib/helpers";
import {
  Calendar,
  Eye,
  File,
  FileCode,
  FileText,
  FolderOpen,
  Image,
  Loader2,
  Lock,
  RefreshCw,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FileTypeIcon } from "./FileTypeIcon";
import { StatusBadge } from "./StatusBadge";

interface DocumentModalProps {
  document: Document | null;
  employee: Employee | undefined;
  onClose: () => void;
  onStatusChange: (docId: bigint, status: string) => Promise<void>;
  onDelete: (docId: bigint) => Promise<void>;
}

function DocumentPreview({ fileType }: { fileType: string }) {
  const lower = fileType?.toLowerCase() ?? "";

  if (lower === "pdf") {
    return (
      <div className="relative w-full h-44 bg-white rounded-lg border border-slate-200 shadow-inner overflow-hidden flex flex-col">
        {/* PDF Header Bar */}
        <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          <span>PDF Document</span>
        </div>
        {/* Mock PDF Content */}
        <div className="flex-1 p-4 bg-slate-50 space-y-2.5">
          <div className="h-3 bg-slate-300 rounded w-3/4" />
          <div className="h-2.5 bg-slate-200 rounded w-full" />
          <div className="h-2.5 bg-slate-200 rounded w-5/6" />
          <div className="h-2.5 bg-slate-200 rounded w-4/5" />
          <div className="h-2.5 bg-slate-200 rounded w-full" />
          <div className="h-2.5 bg-slate-200 rounded w-3/4" />
          <div className="flex gap-3 mt-3">
            <div className="flex-1 space-y-2">
              <div className="h-2 bg-slate-200 rounded w-full" />
              <div className="h-2 bg-slate-200 rounded w-4/5" />
              <div className="h-2 bg-slate-200 rounded w-full" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-2 bg-slate-200 rounded w-3/4" />
              <div className="h-2 bg-slate-200 rounded w-full" />
              <div className="h-2 bg-slate-200 rounded w-4/5" />
            </div>
          </div>
        </div>
        {/* PDF Badge */}
        <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          PDF
        </div>
      </div>
    );
  }

  if (lower === "doc" || lower === "docx") {
    return (
      <div className="relative w-full h-44 bg-white rounded-lg border border-slate-200 shadow-inner overflow-hidden flex flex-col">
        {/* DOC Header Bar */}
        <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5" />
          <span>Word Document</span>
        </div>
        {/* Mock DOC Content */}
        <div className="flex-1 p-4 bg-white space-y-2.5">
          <div className="h-4 bg-blue-100 rounded w-1/2" />
          <div className="h-2.5 bg-slate-100 rounded w-full" />
          <div className="h-2.5 bg-slate-100 rounded w-11/12" />
          <div className="h-2.5 bg-slate-100 rounded w-4/5" />
          <div className="h-2.5 bg-slate-100 rounded w-full" />
          <div className="h-px bg-slate-200 my-2" />
          <div className="h-2.5 bg-slate-100 rounded w-3/4" />
          <div className="h-2.5 bg-slate-100 rounded w-full" />
        </div>
        {/* DOC Badge */}
        <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {lower.toUpperCase()}
        </div>
      </div>
    );
  }

  if (
    lower === "img" ||
    lower === "jpg" ||
    lower === "jpeg" ||
    lower === "png"
  ) {
    return (
      <div className="relative w-full h-44 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-lg border border-slate-200 shadow-inner overflow-hidden flex items-center justify-center">
        {/* Mock Image Grid */}
        <div className="absolute inset-0 opacity-20 grid grid-cols-4 grid-rows-3 gap-px bg-emerald-200">
          <div className="bg-emerald-400" style={{ opacity: 0.3 }} />
          <div className="bg-emerald-400" style={{ opacity: 0.45 }} />
          <div className="bg-emerald-400" style={{ opacity: 0.6 }} />
          <div className="bg-emerald-400" style={{ opacity: 0.75 }} />
          <div className="bg-emerald-400" style={{ opacity: 0.45 }} />
          <div className="bg-emerald-400" style={{ opacity: 0.6 }} />
          <div className="bg-emerald-400" style={{ opacity: 0.75 }} />
          <div className="bg-emerald-400" style={{ opacity: 0.3 }} />
          <div className="bg-emerald-400" style={{ opacity: 0.6 }} />
          <div className="bg-emerald-400" style={{ opacity: 0.75 }} />
          <div className="bg-emerald-400" style={{ opacity: 0.3 }} />
          <div className="bg-emerald-400" style={{ opacity: 0.45 }} />
        </div>
        <div className="relative flex flex-col items-center gap-2 text-emerald-700">
          <Image className="w-12 h-12 opacity-60" />
          <span className="text-xs font-medium opacity-70">Image File</span>
        </div>
        {/* IMG Badge */}
        <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {lower.toUpperCase()}
        </div>
      </div>
    );
  }

  // Generic file preview
  return (
    <div className="relative w-full h-44 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 shadow-inner overflow-hidden flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <File className="w-12 h-12" />
        <div className="space-y-1 w-24">
          <div className="h-1.5 bg-slate-300 rounded w-full" />
          <div className="h-1.5 bg-slate-300 rounded w-3/4" />
          <div className="h-1.5 bg-slate-300 rounded w-5/6" />
        </div>
        <span className="text-xs font-medium mt-1 uppercase">
          {fileType} File
        </span>
      </div>
    </div>
  );
}

export function DocumentModal({
  document: doc,
  employee,
  onClose,
  onStatusChange,
  onDelete,
}: DocumentModalProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const currentStatus = localStatus ?? doc?.status ?? "";

  async function handleStatusChange(newStatus: string) {
    if (!doc) return;
    setIsUpdatingStatus(true);
    setLocalStatus(newStatus);
    try {
      await onStatusChange(doc.id, newStatus);
    } catch {
      setLocalStatus(null);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleDelete() {
    if (!doc) return;
    setIsDeleting(true);
    try {
      await onDelete(doc.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }

  function handleViewDocument() {
    toast.info(
      "Document preview is not available for uploaded files stored in the system.",
      {
        duration: 4000,
      },
    );
  }

  if (!doc) return null;

  const avatarColor = employee
    ? getAvatarColor(employee.name)
    : "from-slate-400 to-slate-500";

  return (
    <Dialog open={!!doc} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 pt-6 pb-5">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <FileTypeIcon
                fileType={doc.fileType}
                className="w-12 h-12 flex-shrink-0 border border-white/20"
                size={22}
              />
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-white text-lg font-display leading-tight mb-1">
                  {doc.title}
                </DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={currentStatus} className="mt-1" />
                  <span className="text-white/50 text-xs mt-1">·</span>
                  <span className="text-white/60 text-xs mt-1">
                    {doc.category}
                  </span>
                  <span className="text-white/50 text-xs mt-1">·</span>
                  <span className="text-white/60 text-xs mt-1 uppercase">
                    {doc.fileType}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Document Preview */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Document Preview
              </p>
              <DocumentPreview fileType={doc.fileType} />
              <div className="flex items-center gap-1.5 justify-center mt-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <p className="text-xs text-slate-400 text-center">
                  Preview not available — file stored securely
                </p>
              </div>

              {/* View Document Button */}
              <Button
                variant="outline"
                className="w-full mt-3 flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                onClick={handleViewDocument}
              >
                <Eye className="w-4 h-4" />
                View Document
              </Button>
            </div>

            {/* Right: Details & Actions */}
            <div className="space-y-5">
              {/* Employee Info */}
              {employee && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                  >
                    {getInitials(employee.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {employee.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {employee.designation} · {employee.workName}
                    </p>
                  </div>
                </div>
              )}

              {/* Document Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase tracking-wider">
                    <Tag className="w-3 h-3" />
                    Category
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {doc.category}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase tracking-wider">
                    <FolderOpen className="w-3 h-3" />
                    File Type
                  </div>
                  <p className="text-sm font-medium text-slate-700 uppercase">
                    {doc.fileType}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    Upload Date
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {formatDate(doc.uploadDate)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    Expiry Date
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {formatDate(doc.expiryDate)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Status Change */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase tracking-wider">
                  <RefreshCw className="w-3 h-3" />
                  Update Status
                </div>
                <Select
                  value={currentStatus}
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-full">
                    {isUpdatingStatus ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      <SelectValue />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
