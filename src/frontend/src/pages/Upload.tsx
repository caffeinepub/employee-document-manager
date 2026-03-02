import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { DOCUMENT_CATEGORIES, todayISO } from "@/lib/helpers";
import {
  CheckCircle2,
  CloudUpload,
  FilePlus,
  Loader2,
  Upload as UploadIcon,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface UploadProps {
  employees: Employee[];
  isLoading: boolean;
  onUpload: (params: {
    employeeId: bigint;
    title: string;
    category: string;
    status: string;
    uploadDate: string;
    expiryDate: string;
    fileType: string;
    fileUrl: string;
  }) => Promise<void>;
}

interface FormState {
  employeeId: string;
  title: string;
  category: string;
  fileType: string;
  expiryDate: string;
}

const INITIAL_FORM: FormState = {
  employeeId: "",
  title: "",
  category: "",
  fileType: "",
  expiryDate: "",
};

export function Upload({ employees, isLoading, onUpload }: UploadProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [simulatedFile, setSimulatedFile] = useState<string | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validate(): boolean {
    const newErrors: Partial<FormState> = {};
    if (!form.employeeId) newErrors.employeeId = "Please select an employee";
    if (!form.title.trim()) newErrors.title = "Document title is required";
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.fileType) newErrors.fileType = "Please select a file type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function processFile(file: File) {
    setSimulatedFile(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "pdf") setForm((f) => ({ ...f, fileType: "pdf" }));
    else if (ext === "doc" || ext === "docx")
      setForm((f) => ({ ...f, fileType: "doc" }));
    else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
      setForm((f) => ({ ...f, fileType: "img" }));
    if (!form.title && file.name) {
      setForm((f) => ({ ...f, title: file.name.replace(/\.[^.]+$/, "") }));
    }
    // Read file as base64 data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataUrl((e.target?.result as string) ?? null);
    };
    reader.readAsDataURL(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave() {
    setIsDragging(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onUpload({
        employeeId: BigInt(form.employeeId),
        title: form.title.trim(),
        category: form.category,
        status: "Pending",
        uploadDate: todayISO(),
        expiryDate: form.expiryDate,
        fileType: form.fileType,
        fileUrl: fileDataUrl ?? "",
      });
      toast.success("Document uploaded successfully!", {
        description: `"${form.title}" has been added and is pending review.`,
      });
      setForm(INITIAL_FORM);
      setSimulatedFile(null);
      setFileDataUrl(null);
      setErrors({});
    } catch {
      toast.error("Failed to upload document", {
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">
          Upload Document
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add a new document for an employee. All uploads are set to Pending
          review.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-5">
            {/* File Drop Zone */}
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                File
              </Label>
              <label
                htmlFor="file-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 p-8
                  flex flex-col items-center justify-center text-center
                  ${
                    isDragging
                      ? "border-blue-400 bg-blue-50 scale-[1.01]"
                      : simulatedFile
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
                  }
                `}
              >
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileInput}
                />
                {simulatedFile ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-emerald-200">
                      <FilePlus className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700 font-medium max-w-[260px] truncate">
                        {simulatedFile}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSimulatedFile(null);
                          setFileDataUrl(null);
                        }}
                        className="ml-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-emerald-600">File ready</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto">
                      <CloudUpload className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600">
                        Drag & drop your file here
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        or click to browse · PDF, DOC, JPG, PNG
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Employee */}
            <div className="space-y-1.5">
              <Label
                htmlFor="employee"
                className="text-sm font-semibold text-slate-700"
              >
                Employee <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.employeeId}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, employeeId: v }));
                  setErrors((e) => ({ ...e, employeeId: undefined }));
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="employee"
                  className={
                    errors.employeeId
                      ? "border-rose-400 focus:ring-rose-400"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select an employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem
                      key={emp.id.toString()}
                      value={emp.id.toString()}
                    >
                      {emp.name} — {emp.workName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employeeId && (
                <p className="text-xs text-rose-500 mt-0.5">
                  {errors.employeeId}
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-slate-700"
              >
                Document Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Employment Contract 2025"
                value={form.title}
                onChange={(e) => {
                  setForm((f) => ({ ...f, title: e.target.value }));
                  setErrors((er) => ({ ...er, title: undefined }));
                }}
                className={
                  errors.title
                    ? "border-rose-400 focus-visible:ring-rose-400"
                    : ""
                }
              />
              {errors.title && (
                <p className="text-xs text-rose-500 mt-0.5">{errors.title}</p>
              )}
            </div>

            {/* Category + File Type row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="category"
                  className="text-sm font-semibold text-slate-700"
                >
                  Category <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => {
                    setForm((f) => ({ ...f, category: v }));
                    setErrors((e) => ({ ...e, category: undefined }));
                  }}
                >
                  <SelectTrigger
                    id="category"
                    className={errors.category ? "border-rose-400" : ""}
                  >
                    <SelectValue placeholder="Category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-rose-500 mt-0.5">
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="fileType"
                  className="text-sm font-semibold text-slate-700"
                >
                  File Type <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={form.fileType}
                  onValueChange={(v) => {
                    setForm((f) => ({ ...f, fileType: v }));
                    setErrors((e) => ({ ...e, fileType: undefined }));
                  }}
                >
                  <SelectTrigger
                    id="fileType"
                    className={errors.fileType ? "border-rose-400" : ""}
                  >
                    <SelectValue placeholder="Type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="img">Image</SelectItem>
                  </SelectContent>
                </Select>
                {errors.fileType && (
                  <p className="text-xs text-rose-500 mt-0.5">
                    {errors.fileType}
                  </p>
                )}
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <Label
                htmlFor="expiryDate"
                className="text-sm font-semibold text-slate-700"
              >
                Expiry Date{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expiryDate: e.target.value }))
                }
                min={todayISO()}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 w-4 h-4" />
                    Upload Document
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm(INITIAL_FORM);
                  setSimulatedFile(null);
                  setFileDataUrl(null);
                  setErrors({});
                }}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
