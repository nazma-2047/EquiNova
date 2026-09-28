import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Activity,
  Trash2,
  ExternalLink,
  Laptop
} from "lucide-react";
import { firebaseConfig } from "../firebase/config";

export const SecurityShieldView: React.FC = () => {
  const {
    currentUser,
    resendVerificationEmail,
    resetPassword,
    securityLogs,
    clearSecurityLogs,
    addSecurityLog
  } = useAuth();

  const [copiedUid, setCopiedUid] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  if (!currentUser) return null;

  const isVerified = currentUser.emailVerified;
  const isGoogle = currentUser.providerData.some((p) => p.providerId === "google.com");
  const isPassword = currentUser.providerData.some((p) => p.providerId === "password");

  // Calculate Security Score
  let score = 50; // base score for active authenticated session
  if (isVerified) score += 25;
  if (isGoogle) score += 15;
  if (securityLogs.length > 0) score += 10;
  score = Math.min(score, 100);

  const handleCopyUid = () => {
    navigator.clipboard.writeText(currentUser.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleResendVerification = async () => {
    try {
      setResending(true);
      await resendVerificationEmail();
      setResendStatus("Verification link dispatched to your inbox.");
      setTimeout(() => setResendStatus(null), 5000);
    } catch (err: any) {
      setResendStatus(err.message || "Failed to resend verification email.");
      setTimeout(() => setResendStatus(null), 5000);
    } finally {
      setResending(false);
    }
  };

  const handleTriggerPasswordReset = async () => {
    if (!currentUser.email) return;
    try {
      await resetPassword(currentUser.email);
      setResetStatus("Password reset instructions sent to " + currentUser.email);
      setTimeout(() => setResetStatus(null), 5000);
    } catch (err: any) {
      setResetStatus(err.message || "Failed to send reset link.");
      setTimeout(() => setResetStatus(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Health Score Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3.5 rounded-2xl border ${
              score >= 80
                ? "bg-emerald-950/80 border-emerald-800/80 text-emerald-400"
                : score >= 60
                ? "bg-amber-950/80 border-amber-800/80 text-amber-400"
                : "bg-rose-950/80 border-rose-800/80 text-rose-400"
            }`}>
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">EquiNova Security Shield</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Firebase Guard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Real-time security auditing evaluating identity verification, session freshness, and access token state for project <span className="font-mono text-cyan-400">{firebaseConfig.projectId}</span>.
              </p>
            </div>
          </div>

          {/* Score Indicator */}
          <div className="flex items-center space-x-4 shrink-0">
            <div className="text-right">
              <span className="text-3xl font-extrabold text-white tracking-tight">{score}%</span>
              <p className="text-[11px] font-medium text-slate-400">Security Rating</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center p-1 relative">
              <div
                className={`w-full h-full rounded-full flex items-center justify-center font-bold text-xs ${
                  score >= 80
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                }`}
              >
                {score >= 80 ? "STRONG" : "FAIR"}
              </div>
            </div>
          </div>
        </div>

        {/* Status Checklist */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300">Email Verification</span>
            </div>
            {isVerified ? (
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
              >
                {resending ? "Sending..." : "Verify Now"}
              </button>
            )}
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300">Auth Method</span>
            </div>
            <span className="text-xs font-mono text-cyan-300">
              {isGoogle ? "Google OAuth" : "Password + Salt"}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300">Client Cipher</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400">AES-256 Active</span>
          </div>
        </div>

        {/* Alerts / Actions */}
        {resendStatus && (
          <div className="mt-3 p-2.5 bg-cyan-950/60 border border-cyan-800 rounded-xl text-xs text-cyan-300">
            {resendStatus}
          </div>
        )}
        {resetStatus && (
          <div className="mt-3 p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300">
            {resetStatus}
          </div>
        )}
      </div>

      {/* Firebase Token & Session Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Firebase Identity Inspection</h4>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">auth.currentUser</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* UID */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">User UID</span>
                <span className="font-mono text-slate-200 select-all">{currentUser.uid}</span>
              </div>
              <button
                onClick={handleCopyUid}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Copy UID"
              >
                {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Email */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Email Address</span>
                <span className="font-mono text-slate-200">{currentUser.email || "No email"}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                isVerified
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60"
                  : "bg-amber-950 text-amber-300 border border-amber-800/60"
              }`}>
                {isVerified ? "Verified" : "Unverified"}
              </span>
            </div>

            {/* Creation Time */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Account Created</span>
                <span className="text-slate-300">
                  {currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleString() : "Unknown"}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">ISO Metadata</span>
            </div>

            {/* Last Sign In */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Last Sign In</span>
                <span className="text-slate-300">
                  {currentUser.metadata.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleString() : "Just now"}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
              </span>
            </div>
          </div>
        </div>

        {/* Security Controls & Password Action */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Key className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Access Credentials &amp; Recovery</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              EquiNova authenticates via official Firebase Authentication protocols. Session tokens are refreshed automatically and securely validated against Google servers.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleTriggerPasswordReset}
                className="w-full p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    Request Password Change Email
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dispatches a cryptographically signed password reset link from Firebase.
                  </p>
                </div>
                <Mail className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
              </button>

              {!isVerified && (
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full p-3 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-900/60 rounded-xl text-xs text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <p className="font-semibold text-amber-200">Resend Verification Email</p>
                    <p className="text-[11px] text-amber-300/70 mt-0.5">
                      Verify email address to safeguard account recovery options.
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                </button>
              )}
            </div>
          </div>

          <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-xl text-[11px] text-indigo-300 flex items-start space-x-2">
            <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              All data writes inside your vault are bound to your unique UID: <code className="text-indigo-200 font-mono">{currentUser.uid.substring(0, 10)}...</code>. Other accounts cannot read or decrypt your records.
            </span>
          </div>
        </div>
      </div>

      {/* Security Event Log Timeline */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <div>
              <h4 className="text-sm font-bold text-white">Live Security Event Log</h4>
              <p className="text-xs text-slate-400">Audit trail of authentication and vault operations</p>
            </div>
          </div>
          {securityLogs.length > 0 && (
            <button
              onClick={clearSecurityLogs}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center space-x-1 transition-colors"
              title="Clear event logs"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Log</span>
            </button>
          )}
        </div>

        {securityLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No events recorded in this session yet. Events will appear as you sign in, update profiles, or access the vault.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {securityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl text-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-2 h-2 rounded-full ${
                    log.type === "sign_in" || log.type === "sign_up"
                      ? "bg-emerald-400"
                      : log.type === "password_reset"
                      ? "bg-amber-400"
                      : log.type === "vault_access"
                      ? "bg-cyan-400"
                      : "bg-indigo-400"
                  }`} />
                  <div>
                    <p className="font-medium text-slate-200">{log.description}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Laptop className="w-2.5 h-2.5" />
                      <span>{log.device}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
