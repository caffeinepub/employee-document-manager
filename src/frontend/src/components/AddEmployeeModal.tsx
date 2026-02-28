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
import type { Employee } from "@/hooks/useQueries";
import { WORK_NAMES, WORK_SITES } from "@/lib/helpers";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onAddEmployee: (emp: Omit<Employee, "id">) => Promise<void>;
}

interface FormState {
  name: string;
  aadhaarNumber: string;
  photo: string;
  designation: string;
  workName: string;
  workNameCustom: string;
  workSite: string;
  workSiteCustom: string;
  employmentStatus: string;
  email: string;
}

interface FormErrors {
  name?: string;
  aadhaarNumber?: string;
  designation?: string;
  workName?: string;
  workSite?: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  aadhaarNumber: "",
  photo: "",
  designation: "",
  workName: "",
  workNameCustom: "",
  workSite: "",
  workSiteCustom: "",
  employmentStatus: "Working",
  email: "",
};

export function AddEmployeeModal({
  open,
  onClose,
  onAddEmployee,
}: AddEmployeeModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Employee name is required";
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
    if (!validate()) return;

    const resolvedWorkName =
      form.workName === "__custom__" ? form.workNameCustom : form.workName;
    const resolvedWorkSite =
      form.workSite === "__custom__" ? form.workSiteCustom : form.workSite;

    setIsSubmitting(true);
    try {
      await onAddEmployee({
        name: form.name.trim(),
        aadhaarNumber: form.aadhaarNumber.trim(),
        photo: form.photo.trim(),
        designation: form.designation.trim(),
        workName: resolvedWorkName.trim(),
        workSite: resolvedWorkSite.trim(),
        employmentStatus: form.employmentStatus,
        email: form.email.trim(),
      });
      setForm(INITIAL_FORM);
      setErrors({});
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      setForm(INITIAL_FORM);
      setErrors({});
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            Add New Employee
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          {/* Employee Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="emp-name"
              className="text-sm font-semibold text-slate-700"
            >
              Employee Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="emp-name"
              placeholder="e.g. Rajesh Kumar"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className={errors.name ? "border-rose-400" : ""}
            />
            {errors.name && (
              <p className="text-xs text-rose-500">{errors.name}</p>
            )}
          </div>

          {/* Aadhaar Number */}
          <div className="space-y-1.5">
            <Label
              htmlFor="emp-aadhaar"
              className="text-sm font-semibold text-slate-700"
            >
              Aadhaar Number <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="emp-aadhaar"
              placeholder="XXXX-XXXX-XXXX"
              value={form.aadhaarNumber}
              onChange={(e) => setField("aadhaarNumber", e.target.value)}
              className={errors.aadhaarNumber ? "border-rose-400" : ""}
            />
            {errors.aadhaarNumber && (
              <p className="text-xs text-rose-500">{errors.aadhaarNumber}</p>
            )}
          </div>

          {/* Photo */}
          <div className="space-y-1.5">
            <Label
              htmlFor="emp-photo"
              className="text-sm font-semibold text-slate-700"
            >
              Photo URL{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="emp-photo"
              placeholder="Photo URL or leave blank"
              value={form.photo}
              onChange={(e) => setField("photo", e.target.value)}
            />
          </div>

          {/* Designation */}
          <div className="space-y-1.5">
            <Label
              htmlFor="emp-designation"
              className="text-sm font-semibold text-slate-700"
            >
              Designation <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="emp-designation"
              placeholder="e.g. Civil Engineer, Foreman, Supervisor"
              value={form.designation}
              onChange={(e) => setField("designation", e.target.value)}
              className={errors.designation ? "border-rose-400" : ""}
            />
            {errors.designation && (
              <p className="text-xs text-rose-500">{errors.designation}</p>
            )}
          </div>

          {/* Work Name */}
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

          {/* Work Site */}
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

          {/* Employment Status */}
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

          {/* Email */}
          <div className="space-y-1.5">
            <Label
              htmlFor="emp-email"
              className="text-sm font-semibold text-slate-700"
            >
              Email{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="emp-email"
              type="email"
              placeholder="employee@company.com"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 w-4 h-4" />
                  Add Employee
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
