import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  VaultRecord,
  VaultCategory,
  fetchUserVault,
  addVaultRecord,
  updateVaultRecord,
  deleteVaultRecord,
  unlockRecordData
} from "../services/vaultService";
import {
  Shield,
  Lock,
  Unlock,
  Key,
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Edit2,
  FileText,
  CreditCard,
  KeyRound,
  Fingerprint,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  Clock,
  CloudCheck,
  CloudOff,
  Tag,
  ShieldAlert
} from "lucide-react";

export const VaultView: React.FC = () => {
  const { currentUser, addSecurityLog } = useAuth();
  const [records, setRecords] = useState<VaultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [masterPasskey, setMasterPasskey] = useState("");
  const [isMasterKeySet, setIsMasterKeySet] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VaultRecord | null>(null);

  // Form inputs
  const [modalTitle, setModalTitle] = useState("");
  const [modalCategory, setModalCategory] = useState<VaultCategory>("login_credential");
  const [modalSensitiveData, setModalSensitiveData] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [modalTags, setModalTags] = useState("");
  const [modalSecurityLevel, setModalSecurityLevel] = useState<"standard" | "high_security">("standard");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-masking timers
  const [autoLockTimers, setAutoLockTimers] = useState<{ [id: string]: number }>({});

  const userId = currentUser?.uid || "";

  const loadVaultData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await fetchUserVault(userId);
      setRecords(result.records);
      setIsCloudSynced(result.isCloudSynced);
    } catch (e) {
      console.error("Vault load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaultData();
  }, [userId]);

  // Handle countdown for unlocked items (auto-hide sensitive content after 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoLockTimers((prev) => {
        const next: { [id: string]: number } = {};
        let hasChanges = false;

        Object.entries(prev).forEach(([recId, timeLeft]) => {
          if (timeLeft > 1) {
            next[recId] = timeLeft - 1;
            hasChanges = true;
          } else {
            // Lock this record
            setRecords((current) =>
              current.map((r) =>
                r.id === recId ? { ...r, isUnlocked: false, decryptedValue: undefined } : r
              )
            );
            hasChanges = true;
          }
        });

        return hasChanges ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleUnlock = async (record: VaultRecord) => {
    if (record.isUnlocked) {
      // Lock it
      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, isUnlocked: false, decryptedValue: undefined } : r))
      );
      setAutoLockTimers((prev) => {
        const copy = { ...prev };
        delete copy[record.id];
        return copy;
      });
    } else {
      // Unlock with passkey or user UID
      try {
        const key = masterPasskey.trim() || userId;
        const decrypted = await unlockRecordData(record, key);
        setRecords((prev) =>
          prev.map((r) => (r.id === record.id ? { ...r, isUnlocked: true, decryptedValue: decrypted } : r))
        );
        // Start 30 second auto-lock timer
        setAutoLockTimers((prev) => ({ ...prev, [record.id]: 30 }));
        addSecurityLog("vault_access", `Decrypted record: "${record.title}"`);
      } catch (err: any) {
        alert(err.message || "Failed to decrypt. Ensure your Master Passkey matches the key used during creation.");
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setModalTitle("");
    setModalCategory("login_credential");
    setModalSensitiveData("");
    setModalNotes("");
    setModalTags("");
    setModalSecurityLevel("standard");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: VaultRecord) => {
    setEditingRecord(record);
    setModalTitle(record.title);
    setModalCategory(record.category);
    setModalSensitiveData(record.decryptedValue || "");
    setModalNotes(record.notes || "");
    setModalTags(record.tags.join(", "));
    setModalSecurityLevel(record.securityLevel);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) {
      setModalError("Please provide a title for this protected record.");
      return;
    }
    if (!editingRecord && !modalSensitiveData.trim()) {
      setModalError("Please enter the sensitive data to encrypt.");
      return;
    }

    setModalSubmitting(true);
    setModalError(null);

    const tagsArray = modalTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (editingRecord) {
        const updated = await updateVaultRecord(userId, editingRecord.id, {
          title: modalTitle,
          category: modalCategory,
          plaintextSensitiveData: modalSensitiveData.trim() ? modalSensitiveData : undefined,
          notes: modalNotes,
          tags: tagsArray,
          securityLevel: modalSecurityLevel,
          masterPasskey: masterPasskey.trim() || undefined
        });

        if (updated) {
          setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          addSecurityLog("vault_access", `Updated protected record: "${modalTitle}"`);
        }
      } else {
        const created = await addVaultRecord(userId, {
          title: modalTitle,
          category: modalCategory,
          plaintextSensitiveData: modalSensitiveData,
          notes: modalNotes,
          tags: tagsArray,
          securityLevel: modalSecurityLevel,
          masterPasskey: masterPasskey.trim() || undefined
        });

        setRecords((prev) => [created, ...prev]);
        addSecurityLog("vault_access", `Created encrypted record: "${modalTitle}"`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || "Failed to save record to vault.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = async (record: VaultRecord) => {
    if (!confirm(`Are you sure you want to permanently delete "${record.title}"?`)) {
      return;
    }
    try {
      await deleteVaultRecord(userId, record.id);
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      addSecurityLog("vault_access", `Deleted record: "${record.title}"`);
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  // Export encrypted backup
  const handleExportBackup = () => {
    const backupData = {
      version: "1.0",
      project: "equinova-f54a7",
      exportedAt: new Date().toISOString(),
      userUid: userId,
      recordsCount: records.length,
      records: records.map(({ decryptedValue, isUnlocked, ...safe }) => safe)
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `equinova-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addSecurityLog("vault_access", "Exported encrypted vault backup");
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || r.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: VaultCategory) => {
    switch (category) {
      case "login_credential":
        return <KeyRound className="w-4 h-4 text-cyan-400" />;
      case "secret_note":
        return <FileText className="w-4 h-4 text-amber-400" />;
      case "api_key":
        return <Fingerprint className="w-4 h-4 text-purple-400" />;
      case "financial":
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case "identity_doc":
        return <Shield className="w-4 h-4 text-blue-400" />;
      case "recovery_phrase":
        return <Lock className="w-4 h-4 text-rose-400" />;
    }
  };

  const getCategoryLabel = (category: VaultCategory) => {
    switch (category) {
      case "login_credential":
        return "Credential";
      case "secret_note":
        return "Secret Note";
      case "api_key":
        return "API Key / Token";
      case "financial":
        return "Financial Card";
      case "identity_doc":
        return "Identity Doc";
      case "recovery_phrase":
        return "2FA Recovery";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Protected Items</p>
            <p className="text-2xl font-bold text-white mt-1">{records.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Encryption Standard</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">AES-256-GCM</p>
            <span className="text-[10px] text-slate-500 font-mono">100k PBKDF2 Iterations</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Sync Status</p>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <p className="text-xs font-semibold text-slate-200">
                {isCloudSynced ? "Firestore Cloud Synced" : "Client Protected Vault"}
              </p>
            </div>
            <span className="text-[10px] text-slate-500">Firebase Auth Token Guard</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            {isCloudSynced ? <CloudCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Shoulder-Surfing Defense</p>
            <p className="text-sm font-bold text-amber-400 mt-1">30s Auto-Lock</p>
            <span className="text-[10px] text-slate-500">Automatic Masking</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Master Passkey Bar (Optional Zero-Knowledge Layer) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-indigo-900/40 border border-indigo-700/50 text-indigo-400 shrink-0 mt-0.5">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-white">Zero-Knowledge Master Passkey (Optional)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 font-medium">
                  Client-Side Derivation
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Leave blank to automatically use your authenticated Firebase user signature, or supply a custom passkey for air-gapped zero-knowledge secrecy.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="password"
              value={masterPasskey}
              onChange={(e) => {
                setMasterPasskey(e.target.value);
                setIsMasterKeySet(e.target.value.length > 0);
              }}
              placeholder="Custom Vault Passkey"
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full md:w-48"
            />
            {isMasterKeySet && (
              <span className="text-emerald-400 text-xs flex items-center gap-1 shrink-0 font-medium">
                <Check className="w-3.5 h-3.5" /> Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by title, notes, or tags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Items" },
            { id: "login_credential", label: "Credentials" },
            { id: "secret_note", label: "Notes" },
            { id: "api_key", label: "API Keys" },
            { id: "financial", label: "Cards" },
            { id: "recovery_phrase", label: "Recovery" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Primary Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportBackup}
            disabled={records.length === 0}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-850 disabled:opacity-40 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5"
            title="Download encrypted JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={loadVaultData}
            className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl transition-colors"
            title="Refresh vault data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Protected Item</span>
          </button>
        </div>
      </div>

      {/* Record Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Unlocking user vault...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No protected records found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "No items match your active search filter."
              : "Store your passwords, confidential documents, API credentials, and recovery keys securely."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition-all inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Item</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => {
            const timeLeft = autoLockTimers[record.id];
            return (
              <div
                key={record.id}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-cyan-950/10"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        {getCategoryIcon(record.category)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white tracking-tight line-clamp-1">
                          {record.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                          <span>{getCategoryLabel(record.category)}</span>
                          <span>•</span>
                          <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {record.securityLevel === "high_security" && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 text-[10px] font-medium flex items-center gap-1">
                          <ShieldAlert className="w-2.5 h-2.5" /> High Sec
                        </span>
                      )}
                      <button
                        onClick={() => handleOpenEditModal(record)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(record)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sensitive Payload Container */}
                  <div className="my-3 p-3 bg-slate-950 rounded-xl border border-slate-850">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Protected Payload
                      </span>
                      {record.isUnlocked && timeLeft ? (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Auto-locks in {timeLeft}s
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Cipher: {record.encryptedData.ciphertext.substring(0, 12)}...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="font-mono text-xs text-slate-200 truncate flex-1 select-all">
                        {record.isUnlocked && record.decryptedValue ? (
                          <span className="text-cyan-300 font-medium">{record.decryptedValue}</span>
                        ) : (
                          <span className="text-slate-500 tracking-widest">
                            ••••••••••••••••••••••••••••••
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {record.isUnlocked && record.decryptedValue && (
                          <button
                            onClick={() => handleCopy(record.decryptedValue!, record.id)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-850 rounded-lg transition-colors"
                            title="Copy sensitive data"
                          >
                            {copiedId === record.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleUnlock(record)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all flex items-center space-x-1 ${
                            record.isUnlocked
                              ? "bg-amber-950/60 text-amber-300 border-amber-800/80 hover:bg-amber-900/60"
                              : "bg-indigo-950/60 text-indigo-300 border-indigo-800/80 hover:bg-indigo-900/60"
                          }`}
                        >
                          {record.isUnlocked ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Mask</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Decrypt</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Extra Info */}
                  {record.notes && (
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2 italic">
                      "{record.notes}"
                    </p>
                  )}
                </div>

                {/* Tags & Footer */}
                {record.tags.length > 0 && (
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-2 border-t border-slate-800/60">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {record.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] text-slate-300 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingRecord ? "Edit Protected Item" : "Create New Protected Item"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Encrypted with AES-256-GCM before saving
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="e.g. AWS Production Key"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value as VaultCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="login_credential">Login Credential</option>
                    <option value="secret_note">Secret Note / Memo</option>
                    <option value="api_key">API Key / Token</option>
                    <option value="financial">Financial / Bank Card</option>
                    <option value="identity_doc">Identity Document</option>
                    <option value="recovery_phrase">2FA Recovery Codes</option>
                  </select>
                </div>
              </div>

              {/* Sensitive Payload Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sensitive Content (Encrypted)</span>
                  </label>
                  {editingRecord && (
                    <span className="text-[10px] text-slate-500">Leave blank to retain current ciphertext</span>
                  )}
                </div>
                <textarea
                  required={!editingRecord}
                  rows={3}
                  value={modalSensitiveData}
                  onChange={(e) => setModalSensitiveData(e.target.value)}
                  placeholder="Enter passwords, confidential notes, private keys, or credentials..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Notes & Context */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Context / Non-Sensitive Notes (Optional)
                </label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="e.g. Associated with company portal, reset every 90 days"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Tags & Security Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={modalTags}
                    onChange={(e) => setModalTags(e.target.value)}
                    placeholder="prod, aws, admin"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Protection Tier
                  </label>
                  <select
                    value={modalSecurityLevel}
                    onChange={(e) => setModalSecurityLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="standard">Standard Protection</option>
                    <option value="high_security">High Security (Strict Prompt)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
                >
                  {modalSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{editingRecord ? "Save Changes" : "Encrypt & Store"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
