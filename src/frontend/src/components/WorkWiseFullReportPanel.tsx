import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee } from "@/hooks/useQueries";
import { generateWorkWiseFullReport } from "@/lib/docxReportGenerator";
import { Download, FileText, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

interface WorkWiseFullReportPanelProps {
  employees: Employee[];
}

export function WorkWiseFullReportPanel({
  employees,
}: WorkWiseFullReportPanelProps) {
  const [selectedWorkName, setSelectedWorkName] = useState<string>("");
  const [selectedWorkSite, setSelectedWorkSite] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const workNames = useMemo(() => {
    const set = new Set<string>();
    for (const emp of employees) {
      if (emp.workName && emp.workName.trim() !== "") {
        set.add(emp.workName);
      }
    }
    return [...set].sort();
  }, [employees]);

  const workSites = useMemo(() => {
    if (!selectedWorkName) return [];
    const set = new Set<string>();
    for (const emp of employees) {
      if (
        emp.workName === selectedWorkName &&
        emp.workSite &&
        emp.workSite.trim() !== ""
      ) {
        set.add(emp.workSite);
      }
    }
    return [...set].sort();
  }, [employees, selectedWorkName]);

  const handleWorkNameChange = (value: string) => {
    setSelectedWorkName(value);
    setSelectedWorkSite(""); // reset site when work name changes
  };

  const handleDownload = async () => {
    if (!selectedWorkName || isGenerating) return;
    setIsGenerating(true);
    try {
      await generateWorkWiseFullReport(
        employees,
        selectedWorkName,
        selectedWorkSite || null,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-card border border-border bg-white">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-slate-800 text-sm leading-tight">
            Full Employee Details Report (.docx)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate a detailed Word document for all employees under a selected
            work group
          </p>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          {/* Work Name Select */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              Work Name
            </Label>
            <Select
              value={selectedWorkName}
              onValueChange={handleWorkNameChange}
            >
              <SelectTrigger
                data-ocid="report.work_name.select"
                className="h-9 text-sm bg-white border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-indigo-100 transition-colors"
              >
                <SelectValue placeholder="Select Work Name" />
              </SelectTrigger>
              <SelectContent>
                {workNames.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-400 text-center">
                    No work groups found
                  </div>
                ) : (
                  workNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Work Site Select */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              Work Site{" "}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Select
              value={selectedWorkSite}
              onValueChange={setSelectedWorkSite}
              disabled={!selectedWorkName}
            >
              <SelectTrigger
                data-ocid="report.work_site.select"
                className="h-9 text-sm bg-white border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sites</SelectItem>
                {workSites.map((site) => (
                  <SelectItem key={site} value={site}>
                    {site}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Download Button */}
          <div className="flex-shrink-0 pb-0.5">
            <Button
              data-ocid="report.download_button"
              disabled={!selectedWorkName || isGenerating}
              onClick={handleDownload}
              className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isGenerating ? "Generating…" : "Download Full Report"}
            </Button>
          </div>
        </div>

        {/* Helper text */}
        {selectedWorkName && (
          <p className="text-xs text-slate-400 mt-2.5">
            {(() => {
              let count = employees.filter(
                (e) => e.workName === selectedWorkName,
              ).length;
              if (selectedWorkSite) {
                count = employees.filter(
                  (e) =>
                    e.workName === selectedWorkName &&
                    e.workSite === selectedWorkSite,
                ).length;
              }
              return `${count} employee${count !== 1 ? "s" : ""} will be included in the report`;
            })()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
