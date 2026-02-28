import { getStatusConfig } from "@/lib/helpers";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold",
        config.className,
        className,
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          status === "Pending" && "bg-amber-500",
          status === "Approved" && "bg-emerald-500",
          status === "Active" && "bg-blue-500",
          status === "Expired" && "bg-rose-500",
        )}
      />
      {config.label}
    </span>
  );
}
