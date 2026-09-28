import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  deleteUser,
  AuthError
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

export interface SecurityLogItem {
  id: string;
  type: "sign_in" | "sign_up" | "sign_out" | "password_reset" | "email_verify" | "profile_update" | "vault_access";
  description: string;
  timestamp: string;
  device: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<User>;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserDisplayName: (name: string, photoURL?: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  securityLogs: SecurityLogItem[];
  addSecurityLog: (type: SecurityLogItem["type"], description: string) => void;
  clearSecurityLogs: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const formatAuthError = (err: unknown): string => {
  if (!err || typeof err !== "object") return "An unexpected error occurred.";
  const authErr = err as AuthError;
  const code = authErr.code || "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Please verify credentials or register a new account.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/weak-password":
      return "The password is too weak. Please use at least 6 characters with mixed letters and numbers.";
    case "auth/invalid-email":
      return "The email address entered is not valid.";
    case "auth/user-disabled":
      return "This account has been disabled by an administrator.";
    case "auth/operation-not-allowed":
      return "Authentication provider is not enabled in Firebase Console (equinova-f54a7). Please enable 'Email/Password' or 'Google' in Firebase Console > Authentication > Sign-in method.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing authentication.";
    case "auth/popup-blocked":
      return "Authentication popup was blocked by browser. Please allow popups for this site.";
    case "auth/too-many-requests":
      return "Access temporarily blocked due to repeated failed attempts. Reset your password or try again later.";
    case "auth/network-request-failed":
      return "Network connection error. Please verify your internet connection.";
    case "auth/requires-recent-login":
      return "This sensitive action requires recent authentication. Please sign out and sign in again.";
    default:
      return authErr.message || "An authentication error occurred. Please try again.";
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityLogItem[]>(() => {
    try {
      const saved = localStorage.getItem("equinova_security_logs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const clearError = () => setError(null);

  const addSecurityLog = (type: SecurityLogItem["type"], description: string) => {
    const newItem: SecurityLogItem = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      type,
      description,
      timestamp: new Date().toISOString(),
      device: typeof navigator !== "undefined" ? `${navigator.platform || "Web"} • ${navigator.userAgent.includes("Chrome") ? "Chrome/Web Browser" : "Browser"}` : "Web Client"
    };

    setSecurityLogs((prev) => {
      const updated = [newItem, ...prev].slice(0, 50);
      try {
        localStorage.setItem("equinova_security_logs", JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save security logs:", e);
      }
      return updated;
    });
  };

  const clearSecurityLogs = () => {
    setSecurityLogs([]);
    localStorage.removeItem("equinova_security_logs");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, pass: string, displayName?: string): Promise<User> => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Send email verification automatically upon registration
      try {
        await sendEmailVerification(user);
      } catch (verificationErr) {
        console.warn("Could not send initial verification email:", verificationErr);
      }

      addSecurityLog("sign_up", `User registered via email: ${email}`);
      return user;
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User> => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      addSecurityLog("sign_in", `User signed in via email: ${email}`);
      return user;
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  const signInWithGoogle = async (): Promise<User> => {
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      addSecurityLog("sign_in", `User signed in with Google: ${user.email || user.displayName || user.uid}`);
      return user;
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    try {
      const userEmail = currentUser?.email || currentUser?.uid;
      await signOut(auth);
      if (userEmail) {
        addSecurityLog("sign_out", `User signed out: ${userEmail}`);
      }
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      addSecurityLog("password_reset", `Password reset link dispatched to ${email}`);
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  const resendVerificationEmail = async (): Promise<void> => {
    if (!auth.currentUser) throw new Error("No active user to verify.");
    setError(null);
    try {
      await sendEmailVerification(auth.currentUser);
      addSecurityLog("email_verify", `Verification email resent to ${auth.currentUser.email}`);
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  const updateUserDisplayName = async (name: string, photoURL?: string): Promise<void> => {
    if (!auth.currentUser) throw new Error("No active user.");
    setError(null);
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        ...(photoURL ? { photoURL } : {})
      });
      // Force trigger state refresh
      setCurrentUser({ ...auth.currentUser } as User);
      addSecurityLog("profile_update", `Updated profile name to: ${name}`);
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  const deleteAccount = async (): Promise<void> => {
    if (!auth.currentUser) throw new Error("No active user.");
    setError(null);
    try {
      const email = auth.currentUser.email || auth.currentUser.uid;
      await deleteUser(auth.currentUser);
      addSecurityLog("sign_out", `Account deleted: ${email}`);
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    clearError,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    logout,
    resetPassword,
    resendVerificationEmail,
    updateUserDisplayName,
    deleteAccount,
    securityLogs,
    addSecurityLog,
    clearSecurityLogs
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
