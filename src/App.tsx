/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import { Navbar } from "./components/Navbar";
import { FirebaseGuideModal } from "./components/FirebaseGuideModal";
import { ConfigModal } from "./components/ConfigModal";
import { Shield } from "lucide-react";

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400 border-t-transparent animate-spin" />
        </div>
        <h2 className="text-white text-base font-semibold tracking-tight">EquiNova Vault</h2>
        <p className="text-slate-400 text-xs mt-1">Initializing Firebase Authentication...</p>
      </div>
    );
  }

  if (currentUser) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar
        onOpenConfigModal={() => setIsConfigOpen(true)}
        onOpenSetupGuide={() => setIsGuideOpen(true)}
      />
      <main className="flex-1 flex flex-col justify-center">
        <AuthScreen onOpenSetupGuide={() => setIsGuideOpen(true)} />
      </main>

      <FirebaseGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
