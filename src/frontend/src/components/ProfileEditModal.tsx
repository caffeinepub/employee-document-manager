import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User } from "lucide-react";
import { useEffect, useState } from "react";

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  initialEmail: string;
  onSave: (name: string, email: string) => void;
}

export function ProfileEditModal({
  open,
  onOpenChange,
  initialName,
  initialEmail,
  onSave,
}: ProfileEditModalProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Sync fields when the modal opens with fresh values
  useEffect(() => {
    if (open) {
      setName(initialName);
      setEmail(initialEmail);
      setNameError("");
      setEmailError("");
    }
  }, [open, initialName, initialEmail]);

  const validate = () => {
    let valid = true;
    if (!name.trim()) {
      setNameError("Name is required.");
      valid = false;
    } else {
      setNameError("");
    }
    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
    return valid;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(name.trim(), email.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <User className="w-4 h-4 text-primary" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="profile-name"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 opacity-60" />
              Name
            </Label>
            <Input
              id="profile-name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              className="h-10"
            />
            {nameError && (
              <p className="text-xs text-destructive">{nameError}</p>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="profile-email"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 opacity-60" />
              Email
            </Label>
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              className="h-10"
            />
            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-none"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
