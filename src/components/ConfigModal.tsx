import React, { useState } from "react";
import { defaultFirebaseConfig, firebaseConfig, saveCustomConfig, resetToDefaultConfig } from "../firebase/config";
import { Settings, Copy, Check, RotateCcw, Save } from "lucide-react";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [configJson, setConfigJson] = useState(JSON.stringify(firebaseConfig, null, 2));
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(configJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(configJson);
      if (!parsed.apiKey || !parsed.projectId) {
        throw new Error("Config must contain at least apiKey and projectId.");
      }
      saveCustomConfig(parsed);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Firebase Project Configuration</h3>
              <p className="text-xs text-slate-400">Live configuration for project {firebaseConfig.projectId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200">
            {error}
          </div>
        )}

        <div className="relative mb-4">
          <textarea
            rows={10}
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Copy config"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={resetToDefaultConfig}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to EquiNova Defaults</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition-all flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply &amp; Reload</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
