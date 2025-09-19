import React, { useEffect, useState } from "react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Login from "./features/auth/Login";
import DeviceListView from "./views/DeviceListView";
import DeviceConfigView from "./views/DeviceConfigView";
import { getToken, onLogoutEvent, isTokenExpired } from "./services/authToken";
import { scheduleAutoLogout } from "./services/authService";
import { fetchDeviceList, updateDevice } from "./services/authService";
import { useAuthState } from "./hooks/useAuth";
import { Device } from "./types/device";
import "./styles/global.css";

function Main() {
  const { authed, login, logout } = useAuthState();
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Filter and layout state
  const [q, setQ] = useState("");
  const [provider, setProvider] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [layoutMode, setLayoutMode] = useState<"horizontal" | "columns">(
    "columns"
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"known" | "unknown">("known");

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

  function handleEdit(d: any) {
    const mapped: Device = {
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
    };
    setSaveMsg(null);
    setSelectedDeviceId(d.maThietBi || "");
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
        onBack={() => setEditDevice(null)}
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
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Main />
    </QueryClientProvider>
  );
}
