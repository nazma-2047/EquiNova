import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "./Navbar";
import { VaultView } from "./VaultView";
import { SecurityShieldView } from "./SecurityShieldView";
import { AccountProfileView } from "./AccountProfileView";
import { FirebaseGuideModal } from "./FirebaseGuideModal";
import { ConfigModal } from "./ConfigModal";
import { Shield, Lock, Activity, User, Key } from "lucide-react";

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("vault");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onOpenConfigModal={() => setIsConfigOpen(true)}
        onOpenSetupGuide={() => setIsGuideOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile Tab Bar */}
        <div className="flex md:hidden rounded-xl bg-slate-900 border border-slate-800 p-1 mb-6">
          <button
            onClick={() => setActiveTab("vault")}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === "vault"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Vault
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === "security"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === "profile"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Account
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "vault" && <VaultView />}
        {activeTab === "security" && <SecurityShieldView />}
        {activeTab === "profile" && <AccountProfileView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>EquiNova Auth &amp; Data Protection</span>
            <span>•</span>
            <span className="text-slate-400">Firebase Auth &amp; Web Crypto AES-256-GCM</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Firebase Guide
            </button>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Config
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FirebaseGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </div>
  );
};
