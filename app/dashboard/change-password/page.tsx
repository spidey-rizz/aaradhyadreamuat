"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { apiFetch, endpoints } from "@/lib/api";
import {
  Loader2,
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Check,
  X
} from "lucide-react";

export default function ChangePasswordPage() {
  const { status, profile } = useAuth({ redirectIfInvalid: "/login?expired=true" });
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="text-primary animate-spin mb-4" size={48} />
        <p className="text-muted-foreground font-medium animate-pulse">Loading security settings...</p>
      </div>
    );
  }

  const isMinLength = newPassword.length >= 5;
  const isDifferentFromOld = oldPassword && newPassword ? oldPassword !== newPassword : true;
  const isMatching = newPassword && confirmPassword ? newPassword === confirmPassword : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Client-side validations
    if (!oldPassword) {
      setMessage({ type: "error", text: "Please enter your current password." });
      return;
    }

    if (!newPassword) {
      setMessage({ type: "error", text: "Please enter your new password." });
      return;
    }

    if (newPassword.length < 5) {
      setMessage({ type: "error", text: "New password must be at least 5 characters long." });
      return;
    }

    if (oldPassword === newPassword) {
      setMessage({ type: "error", text: "New password cannot be the same as your old password." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirm password do not match." });
      return;
    }

    setLoading(true);

    try {
      await apiFetch(endpoints.updatePassword || "/broker/password/update", {
        method: "POST",
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      setMessage({
        type: "success",
        text: "Password updated successfully! Your account is now secured with the new password.",
      });

      // Clear input fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Optional redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.detail || err.message || "Failed to update password. Please check your current password and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group text-sm font-semibold uppercase tracking-wider cursor-pointer"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      {/* Main Card */}
      <div className="bg-card border border-border rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border pb-6 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-text shrink-0">
            <KeyRound size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
              Change <span className="text-primary-text">Password</span>
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Ensure your account is using a secure password to protect your commissions and data.
            </p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-start gap-3 text-sm font-semibold border animate-in fade-in duration-300 ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
            ) : (
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Old Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Current Password *
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-4 text-muted-foreground" />
              <input
                required
                type={showOld ? "text" : "password"}
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3.5 pl-11 pr-12 text-foreground focus:border-primary outline-none transition-all text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={showOld ? "Hide password" : "Show password"}
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="h-px bg-border/60 my-2" />

          {/* 2. New Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              New Password *
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-4 text-muted-foreground" />
              <input
                required
                type={showNew ? "text" : "password"}
                placeholder="Enter new password (min. 5 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3.5 pl-11 pr-12 text-foreground focus:border-primary outline-none transition-all text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 3. Confirm New Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Confirm New Password *
            </label>
            <div className="relative flex items-center">
              <ShieldCheck size={16} className="absolute left-4 text-muted-foreground" />
              <input
                required
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-background border rounded-xl py-3.5 pl-11 pr-12 text-foreground outline-none transition-all text-sm font-medium ${
                  confirmPassword
                    ? isMatching
                      ? "border-green-500/50 focus:border-green-500"
                      : "border-red-500/50 focus:border-red-500"
                    : "border-border focus:border-primary"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Validation Checklist / Feedback */}
          {newPassword && (
            <div className="bg-muted/40 border border-border/80 rounded-2xl p-4 space-y-2 text-xs font-semibold animate-in fade-in">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                Password Requirements
              </p>
              <div className="flex items-center gap-2">
                {isMinLength ? (
                  <Check size={14} className="text-green-500 shrink-0" />
                ) : (
                  <X size={14} className="text-muted-foreground shrink-0" />
                )}
                <span className={isMinLength ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                  At least 5 characters long
                </span>
              </div>

              {oldPassword && (
                <div className="flex items-center gap-2">
                  {isDifferentFromOld ? (
                    <Check size={14} className="text-green-500 shrink-0" />
                  ) : (
                    <X size={14} className="text-red-500 shrink-0" />
                  )}
                  <span
                    className={
                      isDifferentFromOld
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500"
                    }
                  >
                    {isDifferentFromOld
                      ? "Different from current password"
                      : "Cannot be the same as current password"}
                  </span>
                </div>
              )}

              {confirmPassword && (
                <div className="flex items-center gap-2">
                  {isMatching ? (
                    <Check size={14} className="text-green-500 shrink-0" />
                  ) : (
                    <X size={14} className="text-red-500 shrink-0" />
                  )}
                  <span
                    className={
                      isMatching
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500"
                    }
                  >
                    {isMatching ? "New passwords match" : "Passwords do not match"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading ||
              !oldPassword ||
              !newPassword ||
              !confirmPassword ||
              !isMinLength ||
              !isDifferentFromOld ||
              !isMatching
            }
            className="w-full bg-primary hover:scale-[1.01] active:scale-95 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} />}
            {loading ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
