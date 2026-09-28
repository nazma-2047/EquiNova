import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Shield,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  KeyRound,
  ExternalLink,
  Sparkles,
  HelpCircle,
  FileCheck2
} from "lucide-react";
import { firebaseConfig } from "../firebase/config";

interface AuthScreenProps {
  onOpenSetupGuide: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onOpenSetupGuide }) => {
  const {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetPassword,
    error,
    clearError
  } = useAuth();

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Password strength calculation
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passScore = calculateStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Moderate", "Strong", "Military-Grade"];
  const strengthColors = ["bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-cyan-400"];

  const handleTabChange = (newMode: "login" | "register" | "forgot") => {
    clearError();
    setSuccessNotice(null);
    setResetSent(false);
    setMode(newMode);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessNotice(null);

    if (mode === "register") {
      if (password !== confirmPassword) {
        return;
      }
      if (!agreeTerms) {
        return;
      }
      try {
        setSubmitting(true);
        await signUpWithEmail(email.trim(), password, displayName.trim());
        setSuccessNotice("Account created successfully! Verification link sent to your email.");
      } catch (err) {
        // error is handled by AuthContext
      } finally {
        setSubmitting(false);
      }
    } else if (mode === "login") {
      try {
        setSubmitting(true);
        await signInWithEmail(email.trim(), password);
      } catch (err) {
        // error is handled by AuthContext
      } finally {
        setSubmitting(false);
      }
    } else if (mode === "forgot") {
      if (!email.trim()) return;
      try {
        setSubmitting(true);
        await resetPassword(email.trim());
        setResetSent(true);
      } catch (err) {
        // error is handled by AuthContext
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    try {
      setSubmitting(true);
      await signInWithGoogle();
    } catch (err) {
      // handled
    } finally {
      setSubmitting(false);
    }
  };

  // Quick fill helper for demonstration/evaluation
  const fillSampleDemo = (demoType: "user1" | "user2") => {
    clearError();
    if (demoType === "user1") {
      setEmail("security.lead@equinova.vault");
      setPassword("VaultPass2026!#");
      setConfirmPassword("VaultPass2026!#");
      setDisplayName("Alex Chen (Lead Sec)");
    } else {
      setEmail("demo.user@equinova.app");
      setPassword("SafeGuard#992");
      setConfirmPassword("SafeGuard#992");
      setDisplayName("Sarah Miller");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100">
      <div className="w-full max-w-lg">
        {/* Header Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-cyan-500/10 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {mode === "login" && "Sign In to Your Vault"}
            {mode === "register" && "Create Your Protected Account"}
            {mode === "forgot" && "Recover Account Access"}
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            {mode === "login" && "Zero-trust identity verification & client-side encrypted storage."}
            {mode === "register" && "Setup military-grade protection for your credentials and personal records."}
            {mode === "forgot" && "Enter your registered email to receive a password recovery link."}
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-slate-900/70 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mode Switcher Tabs */}
          {mode !== "forgot" ? (
            <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  mode === "login"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("register")}
                className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  mode === "register"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => handleTabChange("login")}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                ← Back to Sign In
              </button>
              <span className="text-xs text-slate-400">Password Reset</span>
            </div>
          )}

          {/* Error Banner with Firebase Help */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-100">Authentication Alert</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
                {error.includes("Firebase Console") && (
                  <button
                    onClick={onOpenSetupGuide}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline font-semibold"
                  >
                    View 1-Minute Firebase Console Setup Guide →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="mb-5 p-3.5 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-100">Success</p>
                <p className="mt-0.5">{successNotice}</p>
              </div>
            </div>
          )}

          {/* Forgot Password Reset Email Sent Confirmation */}
          {mode === "forgot" && resetSent ? (
            <div className="py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white">Reset Email Dispatched</h3>
              <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                If an account exists for <span className="font-mono text-cyan-300">{email}</span>, a secure password reset link has been dispatched. Please check your inbox and spam folder.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => handleTabChange("login")}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md transition-all"
                >
                  Return to Sign In
                </button>
                <button
                  onClick={() => setResetSent(false)}
                  className="w-full py-2 px-4 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                >
                  Try another email address
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Display Name (Register only) */}
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name or Security Alias
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password (Login and Register) */}
              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      {mode === "register" ? "Master Password" : "Password"}
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => handleTabChange("forgot")}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "register" ? "Min. 6+ chars, numbers & symbols" : "Enter your password"}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter (Register mode) */}
                  {mode === "register" && password.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Strength:</span>
                        <span className={`font-semibold ${
                          passScore <= 1 ? "text-rose-400" : passScore <= 3 ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {strengthLabels[Math.min(passScore, 4)]}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 h-1.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`rounded-full h-full transition-all ${
                              i < passScore ? strengthColors[Math.min(passScore - 1, 4)] : "bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1">
                        <span className={password.length >= 6 ? "text-emerald-400 flex items-center gap-1" : "flex items-center gap-1"}>
                          {password.length >= 6 ? <CheckCircle2 className="w-3 h-3" /> : "•"} At least 6 characters
                        </span>
                        <span className={/[0-9]/.test(password) ? "text-emerald-400 flex items-center gap-1" : "flex items-center gap-1"}>
                          {/[0-9]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : "•"} Contains a number
                        </span>
                        <span className={/[A-Z]/.test(password) ? "text-emerald-400 flex items-center gap-1" : "flex items-center gap-1"}>
                          {/[A-Z]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : "•"} Uppercase letter
                        </span>
                        <span className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-400 flex items-center gap-1" : "flex items-center gap-1"}>
                          {/[^A-Za-z0-9]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : "•"} Special character
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password (Register only) */}
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                    {confirmPassword.length > 0 && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {password === confirmPassword ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    )}
                  </div>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-[11px] text-rose-400 mt-1">Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Terms Checkbox (Register only) */}
              {mode === "register" && (
                <div className="flex items-start space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-400 leading-tight">
                    I acknowledge that data stored in my EquiNova Vault is client-encrypted and safeguarded under Firebase Auth access boundaries.
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || (mode === "register" && (!agreeTerms || password !== confirmPassword))}
                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === "login" && "Sign In Securely"}
                      {mode === "register" && "Complete Registration"}
                      {mode === "forgot" && "Send Recovery Link"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Auth Divider (When not in forgot mode) */}
          {mode !== "forgot" && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-900 px-3 text-slate-500">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center justify-center space-x-3 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.15 0 9.99 0 12s.45 3.85 1.25 5.43l4.03-3.14z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>Google Account</span>
              </button>
            </>
          )}

          {/* Quick Demo Fill Helper */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Quick Test Autofill:
              </span>
              <button
                onClick={onOpenSetupGuide}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5"
              >
                Firebase Status <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillSampleDemo("user1")}
                className="py-1.5 px-2 bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg text-[10px] text-slate-300 text-left transition-colors truncate"
              >
                Lead Security Demo
              </button>
              <button
                type="button"
                onClick={() => fillSampleDemo("user2")}
                className="py-1.5 px-2 bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg text-[10px] text-slate-300 text-left transition-colors truncate"
              >
                Standard User Demo
              </button>
            </div>
          </div>
        </div>

        {/* Security Trust Badges */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Shield className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <p className="text-[10px] font-semibold text-slate-200">Firebase Auth</p>
            <p className="text-[9px] text-slate-500">Secure Tokens</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Lock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <p className="text-[10px] font-semibold text-slate-200">AES-256-GCM</p>
            <p className="text-[9px] text-slate-500">Client-Side Cipher</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <FileCheck2 className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-[10px] font-semibold text-slate-200">User Isolation</p>
            <p className="text-[9px] text-slate-500">Zero Leakage</p>
          </div>
        </div>
      </div>
    </div>
  );
};
