import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import {
  useAddDocument,
  useAddEmployee,
  useDeleteDocument,
  useDocuments,
  useEmployees,
  useUpdateDocumentStatus,
  useUpdateEmployeeStatus,
} from "@/hooks/useQueries";
import type { Document, Employee } from "@/hooks/useQueries";
import { Dashboard } from "@/pages/Dashboard";
import { Documents } from "@/pages/Documents";
import { Employees } from "@/pages/Employees";
import { LoginPage } from "@/pages/LoginPage";
import { Upload } from "@/pages/Upload";
import { Users } from "@/pages/Users";
import { Menu } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Page = "dashboard" | "employees" | "documents" | "upload" | "users";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem("isLoggedIn") === "true",
  );
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterEmployeeId, setFilterEmployeeId] = useState<bigint | null>(null);

  // Backend queries
  const employeesQuery = useEmployees();
  const documentsQuery = useDocuments();
  const addDocumentMutation = useAddDocument();
  const deleteDocumentMutation = useDeleteDocument();
  const updateStatusMutation = useUpdateDocumentStatus();
  const addEmployeeMutation = useAddEmployee();
  const updateEmployeeStatusMutation = useUpdateEmployeeStatus();

  const backendEmployees = employeesQuery.data ?? [];
  const backendDocuments = documentsQuery.data ?? [];

  // Use local state that mirrors backend data (with optimistic updates)
  const [localEmployees, setLocalEmployees] = useState<Employee[]>([]);
  const [localDocuments, setLocalDocuments] = useState<Document[]>([]);

  useEffect(() => {
    if (!employeesQuery.isLoading) {
      setLocalEmployees(backendEmployees);
    }
  }, [backendEmployees, employeesQuery.isLoading]);

  useEffect(() => {
    if (!documentsQuery.isLoading) {
      setLocalDocuments(backendDocuments);
    }
  }, [backendDocuments, documentsQuery.isLoading]);

  const isEmployeesLoading = employeesQuery.isLoading;
  const isDocumentsLoading = documentsQuery.isLoading;

  const handleNavigate = useCallback((page: Page) => {
    if (page !== "documents") {
      setFilterEmployeeId(null);
    }
    setCurrentPage(page);
  }, []);

  const handleViewEmployeeDocs = useCallback((employeeId: bigint) => {
    setFilterEmployeeId(employeeId);
    setCurrentPage("documents");
  }, []);

  const handleAddEmployee = useCallback(
    async (empData: Omit<Employee, "id">) => {
      // Optimistic add with temp id
      const tempId = BigInt(Date.now());
      const newEmp: Employee = { id: tempId, ...empData };
      setLocalEmployees((prev) => [...prev, newEmp]);

      try {
        const realId = await addEmployeeMutation.mutateAsync(empData);
        setLocalEmployees((prev) =>
          prev.map((e) => (e.id === tempId ? { ...e, id: realId } : e)),
        );
        toast.success(`${empData.name} added successfully`);
      } catch {
        setLocalEmployees((prev) => prev.filter((e) => e.id !== tempId));
        toast.error("Failed to add employee");
        throw new Error("Add employee failed");
      }
    },
    [addEmployeeMutation],
  );

  const handleToggleEmployeeStatus = useCallback(
    async (employeeId: bigint, newStatus: string) => {
      setLocalEmployees((employees) =>
        employees.map((e) =>
          e.id === employeeId ? { ...e, employmentStatus: newStatus } : e,
        ),
      );

      try {
        await updateEmployeeStatusMutation.mutateAsync({
          employeeId,
          status: newStatus,
        });
        toast.success(`Status updated to ${newStatus}`);
      } catch {
        employeesQuery.refetch();
        toast.error("Failed to update employee status");
        throw new Error("Update failed");
      }
    },
    [updateEmployeeStatusMutation, employeesQuery],
  );

  const handleUpload = useCallback(
    async (params: {
      employeeId: bigint;
      title: string;
      category: string;
      status: string;
      uploadDate: string;
      expiryDate: string;
      fileType: string;
    }) => {
      // Optimistic update
      const tempId = BigInt(Date.now());
      const newDoc: Document = {
        id: tempId,
        employeeId: params.employeeId,
        title: params.title,
        category: params.category,
        status: params.status,
        uploadDate: params.uploadDate,
        expiryDate: params.expiryDate,
        fileType: params.fileType,
      };
      setLocalDocuments((prev) => [...prev, newDoc]);

      try {
        const realId = await addDocumentMutation.mutateAsync(params);
        // Replace temp id with real id
        setLocalDocuments((prev) =>
          prev.map((d) => (d.id === tempId ? { ...d, id: realId } : d)),
        );
      } catch {
        // Remove optimistic entry on failure
        setLocalDocuments((prev) => prev.filter((d) => d.id !== tempId));
        throw new Error("Failed to upload");
      }
    },
    [addDocumentMutation],
  );

  const handleDelete = useCallback(
    async (docId: bigint) => {
      // Optimistic remove
      setLocalDocuments((docs) => docs.filter((d) => d.id !== docId));

      try {
        await deleteDocumentMutation.mutateAsync(docId);
        toast.success("Document deleted");
      } catch {
        // Re-fetch from backend on failure
        documentsQuery.refetch();
        toast.error("Failed to delete document");
        throw new Error("Delete failed");
      }
    },
    [deleteDocumentMutation, documentsQuery],
  );

  const handleStatusChange = useCallback(
    async (docId: bigint, status: string) => {
      // Optimistic update
      setLocalDocuments((docs) =>
        docs.map((d) => (d.id === docId ? { ...d, status } : d)),
      );

      try {
        await updateStatusMutation.mutateAsync({ documentId: docId, status });
        toast.success(`Status updated to ${status}`);
      } catch {
        documentsQuery.refetch();
        toast.error("Failed to update status");
        throw new Error("Update failed");
      }
    },
    [updateStatusMutation, documentsQuery],
  );

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-white">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <span className="font-display font-bold text-slate-800 text-sm">
            DocuVault
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 max-w-7xl mx-auto">
            {currentPage === "dashboard" && (
              <Dashboard
                employees={localEmployees}
                documents={localDocuments}
                isLoading={isEmployeesLoading || isDocumentsLoading}
                onNavigate={handleNavigate}
              />
            )}
            {currentPage === "employees" && (
              <Employees
                employees={localEmployees}
                documents={localDocuments}
                isLoading={isEmployeesLoading}
                onViewEmployeeDocs={handleViewEmployeeDocs}
                onAddEmployee={handleAddEmployee}
                onToggleEmployeeStatus={handleToggleEmployeeStatus}
                onDeleteDocument={handleDelete}
              />
            )}
            {currentPage === "documents" && (
              <Documents
                employees={localEmployees}
                documents={localDocuments}
                isLoading={isDocumentsLoading}
                filterEmployeeId={filterEmployeeId}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            )}
            {currentPage === "upload" && (
              <Upload
                employees={localEmployees}
                isLoading={isEmployeesLoading}
                onUpload={handleUpload}
              />
            )}
            {currentPage === "users" && <Users />}
          </div>

          {/* Footer */}
          <footer className="border-t border-border px-6 py-4 mt-8">
            <p className="text-xs text-slate-400 text-center">
              © {new Date().getFullYear()} DocuVault. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
