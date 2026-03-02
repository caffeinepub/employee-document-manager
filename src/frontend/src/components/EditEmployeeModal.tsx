import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Employee } from "@/hooks/useQueries";
import { WORK_NAMES, WORK_SITES } from "@/lib/helpers";
import { Loader2, UserCog } from "lucide-react";
import { useEffect, useState } from "react";

interface EditEmployeeModalProps {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onUpdateEmployee: (
    employeeId: bigint,
    data: Omit<Employee, "id">,
  ) => Promise<void>;
}

interface FormState {
  // Personal
  name: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  // Identity
  aadhaarNumber: string;
  panNumber: string;
  // Contact
  mobileNumber: string;
  email: string;
  address: string;
  // Employment
  department: string;
  designation: string;
  dateOfJoining: string;
  employmentStatus: string;
  // Work
  workName: string;
  workNameCustom: string;
  workSite: string;
  workSiteCustom: string;
  // Financial
  salaryStructure: string;
  bankAccountDetails: string;
  ifscCode: string;
  pfNumber: string;
  esiNumber: string;
  // Other
  photo: string;
}

interface FormErrors {
  name?: string;
  aadhaarNumber?: string;
  designation?: string;
  workName?: string;
  workSite?: string;
}

function buildInitialForm(employee: Employee | null): FormState {
  if (!employee) {
    return {
      name: "",
      fatherName: "",
      dateOfBirth: "",
      gender: "",
      aadhaarNumber: "",
      panNumber: "",
      mobileNumber: "",
      email: "",
      address: "",
      department: "",
      designation: "",
      dateOfJoining: "",
      employmentStatus: "Working",
      workName: "",
      workNameCustom: "",
      workSite: "",
      workSiteCustom: "",
      salaryStructure: "",
      bankAccountDetails: "",
      ifscCode: "",
      pfNumber: "",
      esiNumber: "",
      photo: "",
    };
  }

  const isKnownWorkName = (WORK_NAMES as readonly string[]).includes(
    employee.workName,
  );
  const isKnownWorkSite = (WORK_SITES as readonly string[]).includes(
    employee.workSite,
  );

  return {
    name: employee.name,
    fatherName: employee.fatherName,
    dateOfBirth: employee.dateOfBirth,
    gender: employee.gender,
    aadhaarNumber: employee.aadhaarNumber,
    panNumber: employee.panNumber,
    mobileNumber: employee.mobileNumber,
    email: employee.email,
    address: employee.address,
    department: employee.department,
    designation: employee.designation,
    dateOfJoining: employee.dateOfJoining,
    employmentStatus: employee.employmentStatus,
    workName: isKnownWorkName ? employee.workName : "__custom__",
    workNameCustom: isKnownWorkName ? "" : employee.workName,
    workSite: isKnownWorkSite ? employee.workSite : "__custom__",
    workSiteCustom: isKnownWorkSite ? "" : employee.workSite,
    salaryStructure: employee.salaryStructure,
    bankAccountDetails: employee.bankAccountDetails,
    ifscCode: employee.ifscCode,
    pfNumber: employee.pfNumber,
    esiNumber: employee.esiNumber,
    photo: employee.photo,
  };
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
        {title}
      </p>
      <div className="flex-1 h-px bg-amber-200" />
    </div>
  );
}

export function EditEmployeeModal({
  open,
  employee,
  onClose,
  onUpdateEmployee,
}: EditEmployeeModalProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(employee));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && employee) {
      setForm(buildInitialForm(employee));
      setErrors({});
    }
  }, [open, employee]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.aadhaarNumber.trim())
      newErrors.aadhaarNumber = "Aadhaar number is required";
    if (!form.designation.trim())
      newErrors.designation = "Designation is required";
    const resolvedWorkName =
      form.workName === "__custom__" ? form.workNameCustom : form.workName;
    if (!resolvedWorkName.trim()) newErrors.workName = "Work name is required";
    const resolvedWorkSite =
      form.workSite === "__custom__" ? form.workSiteCustom : form.workSite;
    if (!resolvedWorkSite.trim()) newErrors.workSite = "Work site is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !employee) return;

    const resolvedWorkName =
      form.workName === "__custom__" ? form.workNameCustom : form.workName;
    const resolvedWorkSite =
      form.workSite === "__custom__" ? form.workSiteCustom : form.workSite;

    setIsSubmitting(true);
    try {
      await onUpdateEmployee(employee.id, {
        name: form.name.trim(),
        fatherName: form.fatherName.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        aadhaarNumber: form.aadhaarNumber.trim(),
        panNumber: form.panNumber.trim(),
        mobileNumber: form.mobileNumber.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        department: form.department.trim(),
        designation: form.designation.trim(),
        dateOfJoining: form.dateOfJoining,
        employmentStatus: form.employmentStatus,
        workName: resolvedWorkName.trim(),
        workSite: resolvedWorkSite.trim(),
        salaryStructure: form.salaryStructure.trim(),
        bankAccountDetails: form.bankAccountDetails.trim(),
        ifscCode: form.ifscCode.trim(),
        pfNumber: form.pfNumber.trim(),
        esiNumber: form.esiNumber.trim(),
        photo: form.photo.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <UserCog className="w-4 h-4 text-amber-600" />
            </div>
            Edit Employee
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          {/* Employee ID (read-only) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Employee ID
            </Label>
            <Input
              value={employee ? `EMP-${employee.id.toString()}` : ""}
              readOnly
              disabled
              className="bg-slate-50 text-slate-400 cursor-not-allowed font-mono"
            />
          </div>

          <Separator />

          {/* ── Personal Information ── */}
          <SectionHeader title="Personal Information" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-name"
                className="text-sm font-semibold text-slate-700"
              >
                Full Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-emp-name"
                placeholder="e.g. Rajesh Kumar"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className={errors.name ? "border-rose-400" : ""}
              />
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-father"
                className="text-sm font-semibold text-slate-700"
              >
                Father Name
              </Label>
              <Input
                id="edit-emp-father"
                placeholder="e.g. Suresh Kumar"
                value={form.fatherName}
                onChange={(e) => setField("fatherName", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-dob"
                className="text-sm font-semibold text-slate-700"
              >
                Date of Birth
              </Label>
              <Input
                id="edit-emp-dob"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setField("dateOfBirth", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">
                Gender
              </Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setField("gender", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Identity Documents ── */}
          <SectionHeader title="Identity Documents" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-aadhaar"
                className="text-sm font-semibold text-slate-700"
              >
                Aadhaar Number <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-emp-aadhaar"
                placeholder="XXXX-XXXX-XXXX"
                value={form.aadhaarNumber}
                onChange={(e) => setField("aadhaarNumber", e.target.value)}
                className={errors.aadhaarNumber ? "border-rose-400" : ""}
              />
              {errors.aadhaarNumber && (
                <p className="text-xs text-rose-500">{errors.aadhaarNumber}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-pan"
                className="text-sm font-semibold text-slate-700"
              >
                PAN Number
              </Label>
              <Input
                id="edit-emp-pan"
                placeholder="ABCDE1234F"
                value={form.panNumber}
                onChange={(e) =>
                  setField("panNumber", e.target.value.toUpperCase())
                }
                maxLength={10}
              />
            </div>
          </div>

          {/* ── Contact Details ── */}
          <SectionHeader title="Contact Details" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-mobile"
                className="text-sm font-semibold text-slate-700"
              >
                Mobile Number
              </Label>
              <Input
                id="edit-emp-mobile"
                type="tel"
                placeholder="9876543210"
                value={form.mobileNumber}
                onChange={(e) => setField("mobileNumber", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-email"
                className="text-sm font-semibold text-slate-700"
              >
                Email
              </Label>
              <Input
                id="edit-emp-email"
                type="email"
                placeholder="employee@company.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="edit-emp-address"
              className="text-sm font-semibold text-slate-700"
            >
              Address
            </Label>
            <Textarea
              id="edit-emp-address"
              placeholder="Full residential address..."
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              rows={2}
            />
          </div>

          {/* ── Employment Details ── */}
          <SectionHeader title="Employment Details" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-dept"
                className="text-sm font-semibold text-slate-700"
              >
                Department
              </Label>
              <Input
                id="edit-emp-dept"
                placeholder="e.g. Civil, Electrical, HR"
                value={form.department}
                onChange={(e) => setField("department", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-desig"
                className="text-sm font-semibold text-slate-700"
              >
                Designation <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-emp-desig"
                placeholder="e.g. Engineer, Supervisor, Foreman"
                value={form.designation}
                onChange={(e) => setField("designation", e.target.value)}
                className={errors.designation ? "border-rose-400" : ""}
              />
              {errors.designation && (
                <p className="text-xs text-rose-500">{errors.designation}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-doj"
                className="text-sm font-semibold text-slate-700"
              >
                Date of Joining
              </Label>
              <Input
                id="edit-emp-doj"
                type="date"
                value={form.dateOfJoining}
                onChange={(e) => setField("dateOfJoining", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">
                Employment Status
              </Label>
              <div className="flex gap-3">
                {["Working", "Left"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setField("employmentStatus", status)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all duration-150 ${
                      form.employmentStatus === status
                        ? status === "Working"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                          : "bg-slate-100 border-slate-400 text-slate-600"
                        : "border-border text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        status === "Working" ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Work Assignment ── */}
          <SectionHeader title="Work Assignment" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">
                Work Name <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.workName}
                onValueChange={(v) => setField("workName", v)}
              >
                <SelectTrigger
                  className={errors.workName ? "border-rose-400" : ""}
                >
                  <SelectValue placeholder="Select work name..." />
                </SelectTrigger>
                <SelectContent>
                  {WORK_NAMES.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">+ Custom work name</SelectItem>
                </SelectContent>
              </Select>
              {form.workName === "__custom__" && (
                <Input
                  placeholder="Enter custom work name"
                  value={form.workNameCustom}
                  onChange={(e) => setField("workNameCustom", e.target.value)}
                  className="mt-1.5"
                />
              )}
              {errors.workName && (
                <p className="text-xs text-rose-500">{errors.workName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">
                Work Site <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.workSite}
                onValueChange={(v) => setField("workSite", v)}
              >
                <SelectTrigger
                  className={errors.workSite ? "border-rose-400" : ""}
                >
                  <SelectValue placeholder="Select work site..." />
                </SelectTrigger>
                <SelectContent>
                  {WORK_SITES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">+ Custom work site</SelectItem>
                </SelectContent>
              </Select>
              {form.workSite === "__custom__" && (
                <Input
                  placeholder="Enter custom work site"
                  value={form.workSiteCustom}
                  onChange={(e) => setField("workSiteCustom", e.target.value)}
                  className="mt-1.5"
                />
              )}
              {errors.workSite && (
                <p className="text-xs text-rose-500">{errors.workSite}</p>
              )}
            </div>
          </div>

          {/* ── Financial Details ── */}
          <SectionHeader title="Financial Details" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-salary"
                className="text-sm font-semibold text-slate-700"
              >
                Salary Structure
              </Label>
              <Input
                id="edit-emp-salary"
                placeholder="e.g. Grade A, ₹25,000/month"
                value={form.salaryStructure}
                onChange={(e) => setField("salaryStructure", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-bank"
                className="text-sm font-semibold text-slate-700"
              >
                Bank Account Number
              </Label>
              <Input
                id="edit-emp-bank"
                placeholder="Account number"
                value={form.bankAccountDetails}
                onChange={(e) => setField("bankAccountDetails", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-ifsc"
                className="text-sm font-semibold text-slate-700"
              >
                IFSC Code
              </Label>
              <Input
                id="edit-emp-ifsc"
                placeholder="e.g. SBIN0001234"
                value={form.ifscCode}
                onChange={(e) =>
                  setField("ifscCode", e.target.value.toUpperCase())
                }
                maxLength={11}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-pf"
                className="text-sm font-semibold text-slate-700"
              >
                PF Number
              </Label>
              <Input
                id="edit-emp-pf"
                placeholder="PF account number"
                value={form.pfNumber}
                onChange={(e) => setField("pfNumber", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-esi"
                className="text-sm font-semibold text-slate-700"
              >
                ESI Number
              </Label>
              <Input
                id="edit-emp-esi"
                placeholder="ESI registration number"
                value={form.esiNumber}
                onChange={(e) => setField("esiNumber", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-emp-photo"
                className="text-sm font-semibold text-slate-700"
              >
                Photo URL{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="edit-emp-photo"
                placeholder="Photo URL or leave blank"
                value={form.photo}
                onChange={(e) => setField("photo", e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 font-semibold bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserCog className="mr-2 w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
