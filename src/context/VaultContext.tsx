"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { decryptVaultItem } from "@/lib/crypto";

export interface DecryptedVaultItem {
  id: string;
  title: string;
  category: string;
  owner?: string;
  icon: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface VaultContextType {
  vaultItems: DecryptedVaultItem[];
  isLoading: boolean;
  refetchVaultItems: () => Promise<void>;
  addVaultItemLocally: (item: DecryptedVaultItem) => void;
  updateVaultItemLocally: (id: string, updated: Partial<DecryptedVaultItem>) => void;
  removeVaultItemLocally: (id: string) => void;
}

const VaultContext = createContext<VaultContextType>({
  vaultItems: [],
  isLoading: true,
  refetchVaultItems: async () => {},
  addVaultItemLocally: () => {},
  updateVaultItemLocally: () => {},
  removeVaultItemLocally: () => {},
});

export const VaultProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, masterKey } = useAuth();
  const [vaultItems, setVaultItems] = useState<DecryptedVaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVaultItems = useCallback(async () => {
    if (!user || !masterKey) {
      setVaultItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await axios.get(`${apiUrl}/vault`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const encryptedItems = response.data.items || [];
      const decrypted = await Promise.all(
        encryptedItems.map(async (item: any) => {
          try {
            const data = await decryptVaultItem(item.encryptedData, item.iv, masterKey);
            return {
              id: item._id,
              title: item.title,
              category: item.category,
              owner: item.owner || "Personal",
              icon: item.title.charAt(0).toUpperCase(),
              ...data,
            };
          } catch (err) {
            console.error("Failed to decrypt item:", item._id, err);
            return {
              id: item._id,
              title: item.title,
              category: item.category,
              owner: item.owner || "Personal",
              icon: "?",
              username: "Encryption Error",
              password: "",
              url: "",
              notes: "",
            };
          }
        })
      );

      setVaultItems(decrypted);
    } catch (error) {
      console.error("Failed to fetch vault items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, masterKey]);

  useEffect(() => {
    fetchVaultItems();
  }, [fetchVaultItems]);

  const addVaultItemLocally = (item: DecryptedVaultItem) => {
    setVaultItems((prev) => [item, ...prev]);
  };

  const updateVaultItemLocally = (id: string, updated: Partial<DecryptedVaultItem>) => {
    setVaultItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const removeVaultItemLocally = (id: string) => {
    setVaultItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <VaultContext.Provider
      value={{
        vaultItems,
        isLoading,
        refetchVaultItems: fetchVaultItems,
        addVaultItemLocally,
        updateVaultItemLocally,
        removeVaultItemLocally,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => useContext(VaultContext);
