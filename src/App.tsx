import React, { useEffect, useState } from "react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Login from "./features/auth/Login";
import DeviceListView from "./views/DeviceListView";
import DeviceConfigView from "./views/DeviceConfigView";
import { getToken, onLogoutEvent } from "./services/authToken";
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

  // Auto-logout wiring: schedule by token expiry and listen 401 events
  useEffect(() => {
    scheduleAutoLogout();
    const off = onLogoutEvent(() => logout());
    return () => off();
  }, [logout, authed]);

  const token = getToken();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["deviceList", token],
    queryFn: () => fetchDeviceList(token!),
    enabled: !!token && authed,
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
    setEditDevice(mapped);
  }

  async function handleSave(updated: Device) {
    setSaving(true);
    setSaveMsg(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Không có token");
      await updateDevice(updated, token);
      setSaveMsg("Cập nhật thành công!");
      setEditDevice(null);
      refetch();
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
