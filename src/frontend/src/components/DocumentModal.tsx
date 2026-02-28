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
  FolderOpen,
  Loader2,
  RefreshCw,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { FileTypeIcon } from "./FileTypeIcon";
import { StatusBadge } from "./StatusBadge";

interface DocumentModalProps {
  document: Document | null;
  employee: Employee | undefined;
  onClose: () => void;
  onStatusChange: (docId: bigint, status: string) => Promise<void>;
  onDelete: (docId: bigint) => Promise<void>;
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

  if (!doc) return null;

  const avatarColor = employee
    ? getAvatarColor(employee.name)
    : "from-slate-400 to-slate-500";

  return (
    <Dialog open={!!doc} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6">
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
                <StatusBadge status={currentStatus} className="mt-1" />
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {/* Employee Info */}
          {employee && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="flex gap-3 pt-2">
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
      </DialogContent>
    </Dialog>
  );
}
