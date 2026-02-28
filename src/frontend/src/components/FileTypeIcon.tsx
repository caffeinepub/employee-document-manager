import { cn } from "@/lib/utils";
import { File, FileCode, FileText, Image } from "lucide-react";

interface FileTypeIconProps {
  fileType: string;
  className?: string;
  size?: number;
}

export function FileTypeIcon({
  fileType,
  className,
  size = 16,
}: FileTypeIconProps) {
  const lower = fileType?.toLowerCase() ?? "";

  if (lower === "pdf") {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded text-red-600 bg-red-50",
          className,
        )}
      >
        <FileText style={{ width: size, height: size }} />
      </div>
    );
  }
  if (lower === "doc" || lower === "docx") {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded text-blue-600 bg-blue-50",
          className,
        )}
      >
        <FileCode style={{ width: size, height: size }} />
      </div>
    );
  }
  if (lower === "img" || lower === "jpg" || lower === "png") {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded text-emerald-600 bg-emerald-50",
          className,
        )}
      >
        <Image style={{ width: size, height: size }} />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded text-slate-500 bg-slate-50",
        className,
      )}
    >
      <File style={{ width: size, height: size }} />
    </div>
  );
}
