import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Shield,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Camera,
  LogOut,
  Key,
  Database
} from "lucide-react";
import { firebaseConfig } from "../firebase/config";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80"
];

export const AccountProfileView: React.FC = () => {
  const { currentUser, updateUserDisplayName, deleteAccount, logout } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      await updateUserDisplayName(displayName.trim(), photoURL.trim() || undefined);
      setStatusMsg({ text: "Profile updated successfully.", type: "success" });
    } catch (err: any) {
      setStatusMsg({ text: err.message || "Failed to update profile.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAvatar = (url: string) => {
    setPhotoURL(url);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm account removal.");
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      // user will automatically be logged out by AuthContext listener
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account. You may need to re-authenticate first.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Editor Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Account &amp; Security Profile</h3>
            <p className="text-xs text-slate-400">Manage your user identity and security details</p>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`mb-5 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMsg.type === "success"
                ? "bg-emerald-950/80 border border-emerald-800 text-emerald-200"
                : "bg-rose-950/80 border border-rose-800 text-rose-200"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Avatar &amp; Photo</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-lg flex-shrink-0">
                <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                  {photoURL ? (
                    <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-white">
                      {displayName ? displayName.charAt(0).toUpperCase() : currentUser.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full">
                <p className="text-[11px] text-slate-400 mb-2">Choose an avatar or enter custom image URL:</p>
                <div className="flex items-center space-x-2 mb-2">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectAvatar(url)}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                        photoURL === url ? "border-cyan-400 scale-110 shadow-md shadow-cyan-500/30" : "border-slate-700 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {photoURL && (
                    <button
                      type="button"
                      onClick={() => setPhotoURL("")}
                      className="text-[10px] text-slate-500 hover:text-slate-300 underline pl-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Display Name / Handle
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address (Firebase Authenticated)
              </label>
              <input
                type="text"
                disabled
                value={currentUser.email || "No email on record"}
                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-850 rounded-xl text-xs sm:text-sm text-slate-400 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center space-x-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Firebase Project Reference Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <Database className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Firebase Infrastructure
          </h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Project ID</span>
            <span className="text-cyan-300 font-mono font-medium">{firebaseConfig.projectId}</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Auth Domain</span>
            <span className="text-slate-300 font-mono truncate block">{firebaseConfig.authDomain}</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">App ID</span>
            <span className="text-slate-300 font-mono truncate block">{firebaseConfig.appId}</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Protection</span>
            <span className="text-emerald-400 font-medium">User-Scoped</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6">
        <div className="flex items-center space-x-2 text-rose-400 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <h4 className="text-sm font-bold text-rose-300">Danger Zone</h4>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Once your account is deleted, your authentication token is revoked and you will lose access to records encrypted under this user identity.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={logout}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Current Session</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account &amp; Vault</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-800">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Account?</h3>
                <p className="text-xs text-rose-300/80">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              To confirm deletion of account <strong className="text-white">{currentUser.email || currentUser.uid}</strong>, please type <span className="font-mono text-rose-400 font-bold">DELETE</span> below.
            </p>

            {deleteError && (
              <div className="mb-4 p-2.5 bg-rose-950 border border-rose-800 rounded-xl text-xs text-rose-200">
                {deleteError}
              </div>
            )}

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white mb-4 focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText("");
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmationText !== "DELETE"}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition-all"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
