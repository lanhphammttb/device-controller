import React, { useEffect, useState } from "react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Login from "./features/auth/Login";
import DeviceListView, { DRAFT_KEY } from "./views/DeviceListView";
import DeviceConfigView from "./views/DeviceConfigView";
import { getToken, onLogoutEvent, isTokenExpired } from "./services/authToken";
import { scheduleAutoLogout } from "./services/authService";
import { fetchDeviceList, updateDevice } from "./services/authService";
import { useAuthState } from "./hooks/useAuth";
import { Device, DeviceDraft } from "./types/device";
import "./styles/global.css";
import { DraftProvider } from "./contexts/DraftContext";
import { useDrafts } from "./hooks/useDrafts";

function Main() {
  const { authed, login, logout } = useAuthState();
  const { removeDraft } = useDrafts();
  const [editDevice, setEditDevice] = useState<DeviceDraft | null>(() => {
    try {
      const raw = localStorage.getItem("cd_editing_device_json");
      return raw ? (JSON.parse(raw) as DeviceDraft) : null;
    } catch {
      return null;
    }
  });

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const EDIT_KEY = "cd_editing_device_id";
  const EDIT_DEVICE_KEY = "cd_editing_device_json";
  const SELECT_KEY = "cd_selected_device_id";

  // Filter and layout state (persisted)
  const UI_STATE_KEY = "cd_list_ui";
  const [q, setQ] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(UI_STATE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.q ?? "";
    } catch {
      return "";
    }
  });
  const [provider, setProvider] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(UI_STATE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.provider ?? "";
    } catch {
      return "";
    }
  });
  const [source, setSource] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(UI_STATE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.source ?? "";
    } catch {
      return "";
    }
  });
  const [layoutMode, setLayoutMode] = useState<"horizontal" | "columns">(() => {
    try {
      const raw = localStorage.getItem(UI_STATE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return (parsed?.layoutMode as "horizontal" | "columns") ?? "columns";
    } catch {
      return "columns";
    }
  });
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    () => {
      try {
        return localStorage.getItem(SELECT_KEY) || null;
      } catch {
        return null;
      }
    }
  );
  const [activeTab, setActiveTab] = useState<"known" | "unknown">(() => {
    try {
      const raw = localStorage.getItem(UI_STATE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return (parsed?.activeTab as "known" | "unknown") ?? "known";
    } catch {
      return "known";
    }
  });

  // Persist UI state when it changes
  useEffect(() => {
    try {
      const next = { q, provider, source, layoutMode, activeTab };
      localStorage.setItem(UI_STATE_KEY, JSON.stringify(next));
    } catch {}
  }, [q, provider, source, layoutMode, activeTab]);
  const STORAGE_KEY_TABS = "cd_provider_source_tabs";
  const [providerSourceTabs, setProviderSourceTabs] = useState<
    Record<string, string>
  >(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TABS);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_TABS,
        JSON.stringify(providerSourceTabs)
      );
    } catch {}
  }, [providerSourceTabs]);

  // Auto-logout wiring: schedule by token expiry and listen 401 events
  useEffect(() => {
    scheduleAutoLogout();
    const off = onLogoutEvent(() => logout());
    return () => off();
  }, [logout, authed]);

  const token = getToken();
  // If token exists but is expired (e.g., user returns next day), logout immediately
  useEffect(() => {
    if (token && isTokenExpired()) {
      logout();
    }
  }, [token, logout]);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["deviceList", token],
    queryFn: () => fetchDeviceList(),
    enabled: !!token && authed && !isTokenExpired(),
  });

  // Restore editing screen after reload when data arrives
  useEffect(() => {
    try {
      if (editDevice) return;
      const savedId = localStorage.getItem(EDIT_KEY) || "";
      if (!savedId) return;
      const list = (data as any)?.data as any[] | undefined;
      if (!list || !Array.isArray(list)) return;
      const found = list.find(
        (d: any) => String(d.maThietBi || "") === savedId
      );
      if (found) {
        const mapped: Device = {
          baseUrl: found.baseUrl || "",
          mqttUrl: found.mqttUrl || "",
          username: found.username || "",
          password: found.password || "",
          maThietBi: found.maThietBi || "",
          tenThietBi: found.tenThietBi || "",
          maNhaCungCap: found.maNhaCungCap || "",
          tenNhaCungCap: found.tenNhaCungCap || "",
          nguonID: found.nguonID || "",
          tenNguon: found.tenNguon || "",
          dichID: found.dichID || "",
          tenDich: found.tenDich || "",
          ketNoi: !!found.ketNoi,
          kinhDo:
            found.kinhDo === undefined ||
            found.kinhDo === null ||
            found.kinhDo === ""
              ? null
              : String(found.kinhDo),
          viDo:
            found.viDo === undefined || found.viDo === null || found.viDo === ""
              ? null
              : String(found.viDo),
        };
        setEditDevice(mapped);
        setSelectedDeviceId(savedId);
      } else {
        localStorage.removeItem(EDIT_KEY);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function handleEdit(d: any) {
    const mapped: DeviceDraft = {
      baseUrl: d.baseUrl || "",
      mqttUrl: d.mqttUrl || "",
      username: d.username || "",
      password: d.password || "",
      maThietBi: d.maThietBi || "",
      tenThietBi: d.tenThietBi || "",
      maNhaCungCap: d.maNhaCungCap || "",
      tenNhaCungCap: d.tenNhaCungCap || "",
      nguonID: d.nguonID || "",
      tenNguon: d.tenNguon || "",
      dichID: d.dichID || "",
      tenDich: d.tenDich || "",
      ketNoi: !!d.ketNoi,
      kinhDo:
        d.kinhDo === undefined || d.kinhDo === null || d.kinhDo === ""
          ? null
          : String(d.kinhDo),
      viDo:
        d.viDo === undefined || d.viDo === null || d.viDo === ""
          ? null
          : String(d.viDo),
      __draft: true,
    };
    setSaveMsg(null);
    const id = d.maThietBi || "";
    setSelectedDeviceId(id);
    try {
      if (id) {
        localStorage.setItem(EDIT_KEY, id);
        localStorage.setItem(SELECT_KEY, id);
      }
      localStorage.setItem(EDIT_DEVICE_KEY, JSON.stringify(mapped));
    } catch {}
    setEditDevice(mapped);
  }

  async function handleSave(updated: Device) {
    setSaving(true);
    setSaveMsg(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Không có token");
      const result = await updateDevice(updated, token);
      if (result?.status === 1) {
        setSaveMsg(result.message || "Cập nhật thành công!");
        setEditDevice(null);

        // ✅ Remove from draft via context
        removeDraft(updated.maThietBi);

        // Cleanup localStorage
        try {
          localStorage.removeItem(EDIT_KEY);
          localStorage.removeItem(EDIT_DEVICE_KEY);
          localStorage.removeItem(SELECT_KEY);
        } catch (e) {
          console.error("Failed to cleanup localStorage", e);
        }
        refetch();
      } else {
        setSaveMsg(result?.message || "Cập nhật thất bại!");
      }
    } catch {
      setSaveMsg("Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  }

  if (!authed) return <Login onSuccess={login} />;

  if (editDevice) {
    return (
      <DeviceConfigView
        device={editDevice}
        onBack={() => {
          setEditDevice(null);
          try {
            localStorage.removeItem(EDIT_KEY);
            localStorage.removeItem(EDIT_DEVICE_KEY);
            localStorage.removeItem(SELECT_KEY);
          } catch (e) {
            console.error("Cleanup failed", e);
          }
        }}
        onSave={handleSave}
        onLogout={logout}
        saving={saving}
        saveMsg={saveMsg}
      />
    );
  }

  return (
    <DeviceListView
      data={data?.data}
      isLoading={isLoading}
      isError={isError}
      onLogout={logout}
      onEdit={handleEdit}
      // Filter and layout props
      q={q}
      setQ={setQ}
      provider={provider}
      setProvider={setProvider}
      source={source}
      setSource={setSource}
      layoutMode={layoutMode}
      setLayoutMode={setLayoutMode}
      selectedDeviceId={selectedDeviceId}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      providerSourceTabs={providerSourceTabs}
      setProviderSourceTabs={setProviderSourceTabs}
    />
  );
}

export default function App() {
  return (
    <DraftProvider>
      <QueryClientProvider client={queryClient}>
        <Main />
      </QueryClientProvider>
    </DraftProvider>
  );
}
