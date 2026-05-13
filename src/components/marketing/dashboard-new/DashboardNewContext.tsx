"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Tiny UI context shared by every component on the new dashboard.
 *
 * Concerns:
 *   - which inline edit panel (timeline row) is currently open
 *   - whether the top alert strip is visible
 *   - a single transient toast message
 *
 * TODO(dashboard-new): hook real save flows in `saveMilestoneEdit` to
 * `updateMilestoneAction` once we merge with `/dashboard` data.
 */

export type DashboardNewUiValue = {
  openEditKey: string | null;
  toggleEdit: (key: string) => void;
  closeEdit: () => void;

  alertStripVisible: boolean;
  dismissAlertStrip: () => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;
};

const Ctx = createContext<DashboardNewUiValue | null>(null);

export function DashboardNewUiProvider({ children }: { children: ReactNode }) {
  const [openEditKey, setOpenEditKey] = useState<string | null>(null);
  const [alertStripVisible, setAlertStripVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleEdit = useCallback((key: string) => {
    setOpenEditKey((cur) => (cur === key ? null : key));
  }, []);
  const closeEdit = useCallback(() => setOpenEditKey(null), []);

  const dismissAlertStrip = useCallback(
    () => setAlertStripVisible(false),
    [],
  );

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const value = useMemo(
    () => ({
      openEditKey,
      toggleEdit,
      closeEdit,
      alertStripVisible,
      dismissAlertStrip,
      toastMessage,
      showToast,
    }),
    [
      openEditKey,
      toggleEdit,
      closeEdit,
      alertStripVisible,
      dismissAlertStrip,
      toastMessage,
      showToast,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboardNewUi(): DashboardNewUiValue {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error(
      "useDashboardNewUi must be used inside <DashboardNewUiProvider>.",
    );
  }
  return v;
}
