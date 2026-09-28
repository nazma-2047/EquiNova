import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, ShieldCheck, LogOut, User as UserIcon, Settings, Key, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { firebaseConfig } from "../firebase/config";

interface NavbarProps {
  onOpenConfigModal: () => void;
  onOpenSetupGuide: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenConfigModal,
  onOpenSetupGuide,
  activeTab,
  setActiveTab
}) => {
  const { currentUser, logout, resendVerificationEmail } = useAuth();
  const [resending, setResending] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);

  const handleResend = async () => {
    try {
      setResending(true);
      await resendVerificationEmail();
      setVerifyMsg("Verification email sent! Check your inbox.");
      setTimeout(() => setVerifyMsg(null), 5000);
    } catch (e: any) {
      setVerifyMsg(e.message || "Could not send verification email.");
      setTimeout(() => setVerifyMsg(null), 5000);
    } finally {
      setResending(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">EquiNova</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  Auth &amp; Vault
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Firebase Protected • Project <span className="text-slate-300 font-mono text-[11px]">{firebaseConfig.projectId}</span>
              </p>
            </div>
          </div>

          {/* Navigation Links (If user logged in) */}
          {currentUser && setActiveTab && (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 border border-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("vault")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "vault"
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Data Vault
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "security"
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Security &amp; Sessions
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "profile"
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Account Settings
              </button>
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Firebase Guide button */}
            <button
              onClick={onOpenSetupGuide}
              className="text-xs text-slate-400 hover:text-cyan-400 bg-slate-900 hover:bg-slate-850 border border-slate-800 px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5"
              title="Firebase Console setup instructions"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Firebase Info</span>
            </button>

            {/* Config button */}
            <button
              onClick={onOpenConfigModal}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              title="Firebase Config"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Authenticated user menu */}
            {currentUser ? (
              <div className="flex items-center space-x-2 sm:space-x-3 pl-2 border-l border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs border border-indigo-400/30 shadow-inner">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      currentUser.displayName
                        ? currentUser.displayName.charAt(0).toUpperCase()
                        : currentUser.email?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-medium text-slate-200 leading-none truncate max-w-[120px]">
                      {currentUser.displayName || currentUser.email?.split("@")[0] || "User"}
                    </p>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> Authenticated
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 px-2.5 py-1.5 rounded-lg transition-all"
                  title="Sign out of your account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden sm:inline text-slate-300">Firebase Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global verification notice if email not verified */}
      {currentUser && !currentUser.emailVerified && currentUser.providerData.some(p => p.providerId === "password") && (
        <div className="bg-amber-950/80 border-t border-b border-amber-800/60 px-4 py-2 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Your email <strong className="text-amber-100 font-mono">{currentUser.email}</strong> is not yet verified. Please verify for maximum account protection.
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {verifyMsg && <span className="text-xs text-emerald-400 font-medium">{verifyMsg}</span>}
            <button
              onClick={handleResend}
              disabled={resending}
              className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-850 text-amber-100 rounded border border-amber-700/60 text-[11px] font-medium transition-colors flex items-center space-x-1"
            >
              {resending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
              <span>{resending ? "Sending..." : "Resend Link"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
