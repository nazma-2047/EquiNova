import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase/config";
import { encryptData, decryptData } from "../utils/cryptoUtils";

export type VaultCategory =
  | "login_credential"
  | "secret_note"
  | "api_key"
  | "identity_doc"
  | "financial"
  | "recovery_phrase";

export interface VaultRecord {
  id: string;
  userId: string;
  title: string;
  category: VaultCategory;
  encryptedData: {
    ciphertext: string;
    iv: string;
    salt: string;
  };
  notes?: string;
  tags: string[];
  securityLevel: "standard" | "high_security";
  createdAt: string;
  updatedAt: string;
  // In-memory runtime decrypted state (not saved)
  decryptedValue?: string;
  isUnlocked?: boolean;
}

const LOCAL_STORAGE_KEY_PREFIX = "equinova_vault_";

export const getLocalVault = (userId: string): VaultRecord[] => {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Could not read local vault fallback:", err);
    return [];
  }
};

export const saveLocalVault = (userId: string, records: VaultRecord[]) => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(records));
  } catch (err) {
    console.warn("Could not save to local vault fallback:", err);
  }
};

// Fetch all vault records for the logged-in user
export async function fetchUserVault(userId: string): Promise<{ records: VaultRecord[]; isCloudSynced: boolean }> {
  try {
    const vaultRef = collection(db, "users", userId, "vault");
    const q = query(vaultRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const cloudRecords: VaultRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      cloudRecords.push({
        id: docSnap.id,
        userId: data.userId || userId,
        title: data.title || "Untitled Record",
        category: data.category || "secret_note",
        encryptedData: data.encryptedData || { ciphertext: "", iv: "", salt: "" },
        notes: data.notes || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        securityLevel: data.securityLevel || "standard",
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString()
      });
    });

    // Also update local cache for resilience
    saveLocalVault(userId, cloudRecords);
    return { records: cloudRecords, isCloudSynced: true };
  } catch (error) {
    console.warn("Firestore access unavailable or restricted, loading local protected vault:", error);
    // Graceful fallback to local protected storage
    const fallback = getLocalVault(userId);
    return { records: fallback, isCloudSynced: false };
  }
}

// Add a new protected vault item
export async function addVaultRecord(
  userId: string,
  params: {
    title: string;
    category: VaultCategory;
    plaintextSensitiveData: string;
    notes?: string;
    tags: string[];
    securityLevel: "standard" | "high_security";
    masterPasskey?: string;
  }
): Promise<VaultRecord> {
  const recordId = "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
  const now = new Date().toISOString();

  // Encrypt with user passkey or user UID
  const encryptionKey = params.masterPasskey?.trim() ? params.masterPasskey : userId;
  const encrypted = await encryptData(params.plaintextSensitiveData, encryptionKey);

  const newRecord: VaultRecord = {
    id: recordId,
    userId,
    title: params.title.trim(),
    category: params.category,
    encryptedData: encrypted,
    notes: params.notes?.trim() || "",
    tags: params.tags.filter(t => t.trim().length > 0),
    securityLevel: params.securityLevel,
    createdAt: now,
    updatedAt: now,
    decryptedValue: params.plaintextSensitiveData,
    isUnlocked: true
  };

  // 1. Always update local storage first
  const currentLocal = getLocalVault(userId);
  saveLocalVault(userId, [newRecord, ...currentLocal]);

  // 2. Attempt Firestore sync
  try {
    const docRef = doc(db, "users", userId, "vault", recordId);
    // Stripping runtime in-memory decrypted fields
    const { decryptedValue, isUnlocked, ...dbPayload } = newRecord;
    await setDoc(docRef, dbPayload);
  } catch (err) {
    console.warn("Firestore write skipped/offline. Stored in client encrypted vault:", err);
  }

  return newRecord;
}

// Update an existing record
export async function updateVaultRecord(
  userId: string,
  recordId: string,
  updates: {
    title?: string;
    category?: VaultCategory;
    plaintextSensitiveData?: string;
    notes?: string;
    tags?: string[];
    securityLevel?: "standard" | "high_security";
    masterPasskey?: string;
  }
): Promise<VaultRecord | null> {
  const currentLocal = getLocalVault(userId);
  const targetIndex = currentLocal.findIndex(r => r.id === recordId);
  if (targetIndex === -1) return null;

  const existing = currentLocal[targetIndex];
  const now = new Date().toISOString();

  let encrypted = existing.encryptedData;
  let newDecryptedValue = existing.decryptedValue;

  if (updates.plaintextSensitiveData !== undefined) {
    const encryptionKey = updates.masterPasskey?.trim() ? updates.masterPasskey : userId;
    encrypted = await encryptData(updates.plaintextSensitiveData, encryptionKey);
    newDecryptedValue = updates.plaintextSensitiveData;
  }

  const updatedRecord: VaultRecord = {
    ...existing,
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    category: updates.category !== undefined ? updates.category : existing.category,
    encryptedData: encrypted,
    notes: updates.notes !== undefined ? updates.notes.trim() : existing.notes,
    tags: updates.tags !== undefined ? updates.tags : existing.tags,
    securityLevel: updates.securityLevel !== undefined ? updates.securityLevel : existing.securityLevel,
    updatedAt: now,
    decryptedValue: newDecryptedValue,
    isUnlocked: newDecryptedValue ? true : existing.isUnlocked
  };

  currentLocal[targetIndex] = updatedRecord;
  saveLocalVault(userId, currentLocal);

  try {
    const docRef = doc(db, "users", userId, "vault", recordId);
    const { decryptedValue, isUnlocked, ...dbPayload } = updatedRecord;
    await updateDoc(docRef, dbPayload);
  } catch (err) {
    console.warn("Firestore update skipped/offline:", err);
  }

  return updatedRecord;
}

// Delete a vault record
export async function deleteVaultRecord(userId: string, recordId: string): Promise<void> {
  // Remove from local storage
  const currentLocal = getLocalVault(userId);
  const filtered = currentLocal.filter(r => r.id !== recordId);
  saveLocalVault(userId, filtered);

  // Remove from Firestore
  try {
    const docRef = doc(db, "users", userId, "vault", recordId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore delete skipped/offline:", err);
  }
}

// Decrypt a record on demand
export async function unlockRecordData(
  record: VaultRecord,
  keyOrUid: string
): Promise<string> {
  try {
    const plaintext = await decryptData(
      record.encryptedData.ciphertext,
      record.encryptedData.iv,
      record.encryptedData.salt,
      keyOrUid
    );
    return plaintext;
  } catch {
    throw new Error("Unable to decrypt data. Invalid Master Passkey or User Signature.");
  }
}
