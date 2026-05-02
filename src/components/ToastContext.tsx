"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastCtx = { show: (msg: string) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  const show = useCallback((m: string) => {
    setMsg(m);
    setOpen(true);
    window.setTimeout(() => setOpen(false), 2700);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className={`toast ${open ? "show" : ""}`} role="status">
        {msg}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast requires ToastProvider");
  return v;
}
