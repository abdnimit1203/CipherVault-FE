"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";

export interface DBUser {
  firebaseUid: string;
  email: string;
  fullName: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  dbUser: DBUser | null;
  loading: boolean;
  masterKey: Uint8Array | null;
  setMasterKey: (key: Uint8Array | null) => void;
  setDbUser: (user: DBUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  loading: true,
  masterKey: null,
  setMasterKey: () => {},
  setDbUser: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [masterKey, setMasterKeyInternal] = useState<Uint8Array | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("masterKey");
      if (stored) {
        setMasterKeyInternal(new Uint8Array(JSON.parse(stored)));
      }
    } catch (e) {
      console.error("Failed to restore masterKey from session", e);
    }
  }, []);

  const setMasterKey = (key: Uint8Array | null) => {
    setMasterKeyInternal(key);
    try {
      if (key) {
        sessionStorage.setItem("masterKey", JSON.stringify(Array.from(key)));
      } else {
        sessionStorage.removeItem("masterKey");
      }
    } catch (e) {
      console.error("Failed to save masterKey to session", e);
    }
  };
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          const response = await axios.get(`${apiUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setDbUser(response.data.user);
        } catch (error) {
          console.error("Failed to fetch DB user:", error);
        }
      } else {
        setDbUser(null);
      }

      setLoading(false);

      // Route Protection Logic
      const isAuthRoute = pathname === "/login" || pathname === "/signup" || pathname === "/";
      
      if (!currentUser && !isAuthRoute) {
        // Redirect to login if accessing protected route without auth
        router.push("/login");
      } else if (currentUser && isAuthRoute && pathname !== "/") {
        // Redirect to dashboard if trying to access login/signup while already authenticated
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const logout = async () => {
    try {
      await signOut(auth);
      setMasterKey(null);
      setDbUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, masterKey, setMasterKey, setDbUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
