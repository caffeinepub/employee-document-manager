import { ProfileEditModal } from "@/components/ProfileEditModal";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Pencil,
  Upload,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

type Page = "dashboard" | "employees" | "documents" | "upload" | "users";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Employees", icon: Users },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "upload", label: "Upload Document", icon: Upload },
  { id: "users", label: "User Management", icon: UserCog },
];

export function Sidebar({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  onLogout,
}: SidebarProps) {
  const { profile, updateProfile } = useProfile();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const avatarInitial = profile.name.charAt(0).toUpperCase();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClose();
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-40 flex flex-col w-64 shadow-sidebar transition-transform duration-300",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ background: "oklch(var(--sidebar))" }}
      >
        {/* Logo / Brand */}
        <div
          className="flex items-center gap-3 px-5 py-5 border-b"
          style={{ borderColor: "oklch(var(--sidebar-border))" }}
        >
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <FolderKanban
              className="w-4.5 h-4.5 text-white"
              style={{ width: 18, height: 18 }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-display font-bold text-sm leading-tight"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              DocuVault
            </p>
            <p
              className="text-xs opacity-50"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              Employee Documents
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "oklch(var(--sidebar-foreground))" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p
            className="text-xs font-semibold uppercase tracking-wider px-3 pb-2 opacity-40"
            style={{ color: "oklch(var(--sidebar-foreground))" }}
          >
            Navigation
          </p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = currentPage === id;
            return (
              <button
                type="button"
                key={id}
                onClick={() => {
                  onNavigate(id);
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group text-left",
                  isActive ? "text-white" : "opacity-70 hover:opacity-100",
                )}
                style={{
                  background: isActive
                    ? "oklch(var(--sidebar-primary) / 0.25)"
                    : "transparent",
                  color: isActive
                    ? "white"
                    : "oklch(var(--sidebar-foreground))",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "oklch(var(--sidebar-accent))";
                    (e.currentTarget as HTMLElement).style.opacity = "1";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.opacity = "0.7";
                  }
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    color: isActive
                      ? "oklch(var(--sidebar-primary))"
                      : undefined,
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                </span>
                <span className="flex-1">{label}</span>
                {isActive && (
                  <ChevronRight
                    className="w-3.5 h-3.5 opacity-60"
                    style={{ width: 14, height: 14 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="px-4 py-4 border-t space-y-3"
          style={{ borderColor: "oklch(var(--sidebar-border))" }}
        >
          {/* Profile area — clickable to open edit modal */}
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            className="group w-full flex items-center gap-3 rounded-lg px-1 py-1 -mx-1 transition-all duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary/50"
            aria-label="Edit profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {avatarInitial}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: "oklch(var(--sidebar-foreground))" }}
              >
                {profile.name}
              </p>
              <p
                className="text-xs opacity-50 truncate"
                style={{ color: "oklch(var(--sidebar-foreground))" }}
              >
                {profile.email}
              </p>
            </div>
            <Pencil
              className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            />
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("isLoggedIn");
              onLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 opacity-60 hover:opacity-100"
            style={{
              color: "oklch(var(--sidebar-foreground))",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "oklch(0.58 0.22 27 / 0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        initialName={profile.name}
        initialEmail={profile.email}
        onSave={updateProfile}
      />
    </>
  );
}
