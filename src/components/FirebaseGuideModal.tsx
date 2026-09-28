import React from "react";
import { Shield, Key, ExternalLink, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { firebaseConfig } from "../firebase/config";

interface FirebaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Firebase Console &amp; Auth Setup</h3>
              <p className="text-xs text-slate-400">Project: <span className="font-mono text-cyan-400">{firebaseConfig.projectId}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Your application is configured with the <strong className="text-white">equinova-f54a7</strong> Firebase web app. To ensure full functionality across registration, email login, and Google sign-in:
          </p>

          {/* Steps */}
          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-900 text-cyan-300 text-[10px] flex items-center justify-center font-bold">1</span>
                  Enable Email/Password Sign-In
                </span>
                <span className="text-[10px] text-cyan-400">Recommended</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                In your Firebase Console, navigate to <strong>Build &gt; Authentication &gt; Sign-in method</strong>, click on <strong>Email/Password</strong>, and switch it to <strong>Enable</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-900 text-indigo-300 text-[10px] flex items-center justify-center font-bold">2</span>
                  Enable Google Provider (Optional)
                </span>
                <span className="text-[10px] text-indigo-400">OAuth Popup</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Under the same <strong>Sign-in method</strong> tab, enable <strong>Google</strong> and provide a project support email to allow users to sign in with their Google accounts.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-purple-900 text-purple-300 text-[10px] flex items-center justify-center font-bold">3</span>
                  Authorized Domains Check
                </span>
                <span className="text-[10px] text-emerald-400">Security</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                In <strong>Authentication &gt; Settings &gt; Authorized domains</strong>, ensure your current preview URL or domain is listed so Google OAuth popups are accepted.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-900 text-emerald-300 text-[10px] flex items-center justify-center font-bold">4</span>
                  Data Protection &amp; Zero-Knowledge
                </span>
                <span className="text-[10px] text-emerald-400">AES-256</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                EquiNova automatically encrypts all sensitive vault payloads using client-side <strong>AES-256-GCM</strong> with 100,000 PBKDF2 iterations before saving. If Firestore is active, it syncs securely; otherwise, it persists to protected local storage without interruption.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>Open Firebase Console for {firebaseConfig.projectId}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
