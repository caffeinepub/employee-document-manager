import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import {
  FolderKanban,
  Loader2,
  Lock,
  Mail,
  Phone,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface LoginPageProps {
  onLogin: () => void;
}

type Mode = "login" | "signup";

export function LoginPage({ onLogin }: LoginPageProps) {
  const { actor } = useActor();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const resetForm = (newMode: Mode) => {
    setMode(newMode);
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setPasswordError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    if (!password) {
      setPasswordError("Password is required.");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (!actor) {
      setError("Connecting to backend, please try again.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "signup") {
        // Register new user then auto-login
        await actor.addAdminUser(email.trim(), phone.trim(), password);
        const success = await actor.login(email.trim(), phone.trim(), password);
        if (success) {
          try {
            await actor.init();
          } catch {
            // init may fail if already initialised — that's fine
          }
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("loginEmail", email.trim());
          onLogin();
        } else {
          setError("Account created but login failed. Please try signing in.");
        }
      } else {
        // Existing login flow
        const success = await actor.login(email.trim(), phone.trim(), password);
        if (success) {
          try {
            await actor.init();
          } catch {
            // init may fail if already initialised — that's fine
          }
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("loginEmail", email.trim());
          onLogin();
        } else {
          setError(
            "Invalid email or phone number. Please check your credentials.",
          );
        }
      }
    } catch {
      setError(
        mode === "signup"
          ? "Sign up failed. This email may already be registered."
          : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "oklch(var(--sidebar))" }}
    >
      {/* Decorative background blobs */}
      <div
        className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: "oklch(var(--sidebar-primary))",
          transform: "translate(-40%, -40%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: "oklch(0.55 0.16 290)",
          transform: "translate(30%, 30%)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{
          background: "oklch(var(--sidebar-primary))",
          transform: "translateY(-50%)",
        }}
      />

      {/* Login / Sign Up card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-2xl shadow-2xl border p-8"
          style={{
            background: "oklch(1 0 0 / 0.05)",
            backdropFilter: "blur(24px)",
            borderColor: "oklch(var(--sidebar-border))",
          }}
        >
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col items-center mb-6"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{ background: "oklch(var(--sidebar-primary))" }}
            >
              <FolderKanban className="w-7 h-7 text-white" />
            </div>
            <h1
              className="font-display text-2xl font-bold mb-1"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              DocuVault
            </h1>
            <p
              className="text-sm opacity-60"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              Employee Document Manager
            </p>
          </motion.div>

          {/* Mode tab switcher */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex rounded-xl p-1 mb-6"
            style={{
              background: "oklch(1 0 0 / 0.06)",
              border: "1px solid oklch(var(--sidebar-border))",
            }}
          >
            {(["login", "signup"] as Mode[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => resetForm(tab)}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50"
                style={
                  mode === tab
                    ? {
                        background: "oklch(var(--sidebar-primary))",
                        color: "white",
                        boxShadow:
                          "0 2px 8px oklch(var(--sidebar-primary) / 0.35)",
                      }
                    : {
                        color: "oklch(var(--sidebar-foreground) / 0.55)",
                      }
                }
              >
                {tab === "signup" && <UserPlus className="w-3.5 h-3.5" />}
                {tab === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </motion.div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: mode === "signup" ? 16 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "signup" ? -16 : 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium flex items-center gap-2"
                  style={{ color: "oklch(var(--sidebar-foreground) / 0.8)" }}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={
                    mode === "login" ? "admin@example.com" : "you@company.com"
                  }
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="h-11"
                  style={{
                    background: "oklch(1 0 0 / 0.08)",
                    borderColor: "oklch(var(--sidebar-border))",
                    color: "oklch(var(--sidebar-foreground))",
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium flex items-center gap-2"
                  style={{ color: "oklch(var(--sidebar-foreground) / 0.8)" }}
                >
                  <Phone className="w-3.5 h-3.5" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="9999999999"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(val);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="h-11"
                  style={{
                    background: "oklch(1 0 0 / 0.08)",
                    borderColor: "oklch(var(--sidebar-border))",
                    color: "oklch(var(--sidebar-foreground))",
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium flex items-center gap-2"
                  style={{ color: "oklch(var(--sidebar-foreground) / 0.8)" }}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  placeholder={
                    mode === "signup"
                      ? "Create a password"
                      : "Enter your password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  disabled={isLoading}
                  className="h-11"
                  style={{
                    background: "oklch(1 0 0 / 0.08)",
                    borderColor: passwordError
                      ? "oklch(0.58 0.22 27)"
                      : "oklch(var(--sidebar-border))",
                    color: "oklch(var(--sidebar-foreground))",
                  }}
                />
              </div>

              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium flex items-center gap-2"
                    style={{ color: "oklch(var(--sidebar-foreground) / 0.8)" }}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    disabled={isLoading}
                    className="h-11"
                    style={{
                      background: "oklch(1 0 0 / 0.08)",
                      borderColor: passwordError
                        ? "oklch(0.58 0.22 27)"
                        : "oklch(var(--sidebar-border))",
                      color: "oklch(var(--sidebar-foreground))",
                    }}
                  />
                </div>
              )}

              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm"
                  style={{
                    background: "oklch(0.58 0.22 27 / 0.15)",
                    borderLeft: "3px solid oklch(0.58 0.22 27)",
                    color: "oklch(0.92 0.04 30)",
                  }}
                >
                  <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{passwordError}</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm"
                  style={{
                    background: "oklch(0.58 0.22 27 / 0.15)",
                    borderLeft: "3px solid oklch(0.58 0.22 27)",
                    color: "oklch(0.92 0.04 30)",
                  }}
                >
                  <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 font-semibold text-sm"
                style={{
                  background: "oklch(var(--sidebar-primary))",
                  color: "white",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "signup" ? "Creating account…" : "Signing in…"}
                  </>
                ) : mode === "signup" ? (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.form>
          </AnimatePresence>

          {/* Demo credentials hint — only in login mode */}
          <AnimatePresence>
            {mode === "login" && (
              <motion.div
                key="demo-hint"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div
                  className="mt-6 rounded-xl px-4 py-3.5"
                  style={{
                    background: "oklch(var(--sidebar-primary) / 0.1)",
                    border: "1px solid oklch(var(--sidebar-primary) / 0.25)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-60"
                    style={{ color: "oklch(var(--sidebar-foreground))" }}
                  >
                    Demo Credentials
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail
                        className="w-3 h-3 opacity-60"
                        style={{ color: "oklch(var(--sidebar-primary))" }}
                      />
                      <span
                        style={{
                          color: "oklch(var(--sidebar-foreground) / 0.7)",
                        }}
                      >
                        Email:
                      </span>
                      <code
                        className="font-mono font-semibold"
                        style={{ color: "oklch(var(--sidebar-primary))" }}
                      >
                        admin@example.com
                      </code>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Phone
                        className="w-3 h-3 opacity-60"
                        style={{ color: "oklch(var(--sidebar-primary))" }}
                      />
                      <span
                        style={{
                          color: "oklch(var(--sidebar-foreground) / 0.7)",
                        }}
                      >
                        Phone:
                      </span>
                      <code
                        className="font-mono font-semibold"
                        style={{ color: "oklch(var(--sidebar-primary))" }}
                      >
                        9999999999
                      </code>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Lock
                        className="w-3 h-3 opacity-60"
                        style={{ color: "oklch(var(--sidebar-primary))" }}
                      />
                      <span
                        style={{
                          color: "oklch(var(--sidebar-foreground) / 0.7)",
                        }}
                      >
                        Password:
                      </span>
                      <code
                        className="font-mono font-semibold"
                        style={{ color: "oklch(var(--sidebar-primary))" }}
                      >
                        Admin@1234
                      </code>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-5 opacity-40"
          style={{ color: "oklch(var(--sidebar-foreground))" }}
        >
          © {new Date().getFullYear()} DocuVault. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-70 transition-opacity"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
