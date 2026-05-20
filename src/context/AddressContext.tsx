import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Address = {
  id: string;
  label: string; // Home, Work, etc
  recipient: string;
  phone: string;
  street: string;
  apt?: string;
  city: string;
  zip: string;
  notes?: string;
  isDefault?: boolean;
};

type Ctx = {
  addresses: Address[];
  defaultAddress: Address | null;
  add: (a: Omit<Address, "id">) => Address;
  update: (id: string, patch: Partial<Address>) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
};

const AddressCtx = createContext<Ctx | null>(null);
const STORAGE = "saveur_addresses";

const SEED: Address[] = [
  { id: "addr-home", label: "Home", recipient: "Jane Doe", phone: "+855 12 345 678", street: "221B Baker Street", apt: "4F", city: "Brooklyn", zip: "11201", notes: "Leave at door", isDefault: true },
  { id: "addr-work", label: "Work", recipient: "Jane Doe", phone: "+855 12 345 678", street: "500 Madison Ave", apt: "Suite 1200", city: "New York", zip: "10022", notes: "Reception desk" },
];

export function AddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>(() => {
    if (typeof window === "undefined") return SEED;
    try {
      const raw = localStorage.getItem(STORAGE);
      return raw ? JSON.parse(raw) : SEED;
    } catch { return SEED; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(addresses));
  }, [addresses]);

  const add: Ctx["add"] = (a) => {
    const id = `addr-${Date.now()}`;
    const isFirst = addresses.length === 0;
    const next: Address = { ...a, id, isDefault: a.isDefault || isFirst };
    setAddresses(prev => {
      const cleared = next.isDefault ? prev.map(x => ({ ...x, isDefault: false })) : prev;
      return [...cleared, next];
    });
    return next;
  };

  const update: Ctx["update"] = (id, patch) => {
    setAddresses(prev => {
      const willBeDefault = patch.isDefault === true;
      return prev.map(a => {
        if (a.id === id) return { ...a, ...patch };
        if (willBeDefault) return { ...a, isDefault: false };
        return a;
      });
    });
  };

  const remove: Ctx["remove"] = (id) => {
    setAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (filtered.length && !filtered.some(a => a.isDefault)) filtered[0].isDefault = true;
      return filtered;
    });
  };

  const setDefault: Ctx["setDefault"] = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const defaultAddress = addresses.find(a => a.isDefault) ?? addresses[0] ?? null;

  return (
    <AddressCtx.Provider value={{ addresses, defaultAddress, add, update, remove, setDefault }}>
      {children}
    </AddressCtx.Provider>
  );
}

export const useAddresses = () => {
  const ctx = useContext(AddressCtx);
  if (!ctx) throw new Error("useAddresses must be used within AddressProvider");
  return ctx;
};
