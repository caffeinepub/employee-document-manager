import { FileTypeIcon } from "@/components/FileTypeIcon";
import { StatusBadge } from "@/components/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";

interface EmployeeDetailSheetProps {
  employee: Employee | null;
  documents: Document[];
  onClose: () => void;
  onViewAllDocs: (employeeId: bigint) => void;
  onToggleStatus: (employeeId: bigint, newStatus: string) => Promise<void>;
  onDeleteDocument: (docId: bigint) => Promise<void>;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (employeeId: bigint) => Promise<void>;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-700 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 pt-1 pb-0.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </p>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

export function EmployeeDetailSheet({
  employee,
  documents,
  onClose,
  onViewAllDocs,
  onToggleStatus,
  onDeleteDocument,
  onEditEmployee,
  onDeleteEmployee,
}: EmployeeDetailSheetProps) {
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<bigint | null>(null);
  const [isDeletingEmployee, setIsDeletingEmployee] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const empDocs = employee
    ? documents.filter((d) => d.employeeId === employee.id)
    : [];
  const avatarColor = employee ? getAvatarColor(employee.name) : "";
  const normalizedStatus = employee
    ? normalizeEmploymentStatus(employee.employmentStatus)
    : "";
  const isWorking = normalizedStatus === "Working";
  const workNameColor = employee ? getWorkNameColor(employee.workName) : "";

  async function handleToggleStatus() {
    if (!employee) return;
    const newStatus = isWorking ? "Left" : "Working";
    setIsTogglingStatus(true);
    try {
      await onToggleStatus(employee.id, newStatus);
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

  async function handleDeleteEmployee() {
    if (!employee) return;
    setIsDeletingEmployee(true);
    try {
      await onDeleteEmployee(employee.id);
      onClose();
    } finally {
      setIsDeletingEmployee(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <>
      <Sheet open={!!employee} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
          {employee && (
            <>
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
                            (e.target as HTMLImageElement).style.display =
                              "none";
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
                    {employee.department && (
                      <p className="text-slate-400 text-xs mt-0.5">
                        {employee.department}
                      </p>
                    )}
                    {employee.email && (
                      <p className="text-slate-400 text-xs mt-0.5 truncate">
                        {employee.email}
                      </p>
                    )}
                    <p className="text-slate-500 text-xs mt-0.5 font-mono">
                      EMP-{employee.id.toString()}
                    </p>
                  </div>
                </div>

                {/* Status badge + action buttons */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditEmployee(employee)}
                    className="h-7 text-xs border-amber-400/40 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 bg-transparent"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeletingEmployee}
                    className="h-7 text-xs border-rose-400/40 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 bg-transparent"
                  >
                    {isDeletingEmployee ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-1">
                {/* Work Assignment */}
                <SectionDivider title="Work Assignment" />
                <div className="grid grid-cols-2 gap-3 mb-2">
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

                {/* Personal */}
                <SectionDivider title="Personal" />
                <div className="divide-y divide-slate-50">
                  {employee.fatherName && (
                    <InfoRow
                      icon={User}
                      label="Father Name"
                      value={employee.fatherName}
                    />
                  )}
                  {employee.dateOfBirth && (
                    <InfoRow
                      icon={Calendar}
                      label="Date of Birth"
                      value={employee.dateOfBirth}
                    />
                  )}
                  {employee.gender && (
                    <InfoRow
                      icon={Users}
                      label="Gender"
                      value={employee.gender}
                    />
                  )}
                </div>

                {/* Identity */}
                <SectionDivider title="Identity" />
                {/* Aadhaar with mask/reveal */}
                <div className="bg-slate-50 rounded-lg p-3 my-2">
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
                {employee.panNumber && (
                  <div className="divide-y divide-slate-50">
                    <InfoRow
                      icon={CreditCard}
                      label="PAN Number"
                      value={employee.panNumber}
                    />
                  </div>
                )}

                {/* Contact */}
                <SectionDivider title="Contact" />
                <div className="divide-y divide-slate-50">
                  {employee.mobileNumber && (
                    <InfoRow
                      icon={Phone}
                      label="Mobile Number"
                      value={employee.mobileNumber}
                    />
                  )}
                  {employee.email && (
                    <InfoRow icon={Mail} label="Email" value={employee.email} />
                  )}
                  {employee.address && (
                    <InfoRow
                      icon={MapPin}
                      label="Address"
                      value={employee.address}
                    />
                  )}
                </div>

                {/* Employment */}
                <SectionDivider title="Employment" />
                <div className="divide-y divide-slate-50">
                  {employee.department && (
                    <InfoRow
                      icon={Briefcase}
                      label="Department"
                      value={employee.department}
                    />
                  )}
                  {employee.dateOfJoining && (
                    <InfoRow
                      icon={Calendar}
                      label="Date of Joining"
                      value={employee.dateOfJoining}
                    />
                  )}
                  {employee.salaryStructure && (
                    <InfoRow
                      icon={Banknote}
                      label="Salary Structure"
                      value={employee.salaryStructure}
                    />
                  )}
                  <InfoRow
                    icon={Shield}
                    label="Employment Status"
                    value={
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isWorking
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isWorking ? "bg-emerald-500" : "bg-slate-400"}`}
                        />
                        {isWorking ? "Working" : "Left"}
                      </span>
                    }
                  />
                </div>

                {/* Financial */}
                {(employee.bankAccountDetails ||
                  employee.ifscCode ||
                  employee.pfNumber ||
                  employee.esiNumber) && (
                  <>
                    <SectionDivider title="Financial" />
                    <div className="divide-y divide-slate-50">
                      {employee.bankAccountDetails && (
                        <InfoRow
                          icon={Banknote}
                          label="Bank Account"
                          value={employee.bankAccountDetails}
                        />
                      )}
                      {employee.ifscCode && (
                        <InfoRow
                          icon={CreditCard}
                          label="IFSC Code"
                          value={employee.ifscCode}
                        />
                      )}
                      {employee.pfNumber && (
                        <InfoRow
                          icon={Shield}
                          label="PF Number"
                          value={employee.pfNumber}
                        />
                      )}
                      {employee.esiNumber && (
                        <InfoRow
                          icon={Shield}
                          label="ESI Number"
                          value={employee.esiNumber}
                        />
                      )}
                    </div>
                  </>
                )}

                {/* Documents section */}
                <div className="pt-3">
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
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Employee Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-rose-600" />
              </div>
              Delete Employee
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                {employee?.name}
              </span>
              ? This will also permanently remove all their documents. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingEmployee}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              disabled={isDeletingEmployee}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeletingEmployee ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Employee"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
