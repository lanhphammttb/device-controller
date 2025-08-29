import React, { useMemo, useState } from "react";
import TopBar from "../components/layout/TopBar";
import Button from "../components/ui/Button";
import { DeviceCard } from "../components/device/DeviceCard";
import { getUserClaims } from "../services/authToken";

export default function DeviceListView({
  data,
  isLoading,
  isError,
  onLogout,
  onEdit,
}: {
  data?: any[];
  isLoading: boolean;
  isError: boolean;
  onLogout: () => void;
  onEdit: (d: any) => void;
}) {
  const [q, setQ] = useState("");
  const [provider, setProvider] = useState<string>("");
  const user = getUserClaims();

  const providers = useMemo(() => {
    const set = new Set<string>();
    (data || []).forEach((d: any) => {
      if (d.maNhaCungCap) set.add(String(d.maNhaCungCap));
    });
    return ["", ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data || []).filter((d: any) => {
      const matchText =
        !term ||
        String(d.maThietBi || "")
          .toLowerCase()
          .includes(term) ||
        String(d.tenThietBi || "")
          .toLowerCase()
          .includes(term);
      const matchProvider =
        !provider || String(d.maNhaCungCap || "") === provider;
      return matchText && matchProvider;
    });
  }, [data, q, provider]);

  return (
    <section className="view">
      <TopBar
        title="Danh sách thiết bị"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {user && (
              <span style={{ color: "#6b7280", fontSize: 14 }}>
                {user.name || user.id || user.email}
              </span>
            )}
            <Button className="btn--ghost" onClick={onLogout}>
              Đăng xuất
            </Button>
          </div>
        }
      />
      <div className="content">
        <div className="card card--padded" style={{ marginBottom: 12 }}>
          <div className="grid grid--2">
            <div className="form__row">
              <label className="form__label" htmlFor="search">
                Tìm kiếm (Mã/Tên thiết bị)
              </label>
              <input
                id="search"
                className="input"
                placeholder="Nhập mã hoặc tên thiết bị..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="form__row">
              <label className="form__label" htmlFor="provider">
                Mã nhà cung cấp
              </label>
              <select
                id="provider"
                className="input"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                {providers.map((p) => (
                  <option key={p || "all"} value={p}>
                    {p ? p : "Tất cả"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="notice notice--info">
            Đang tải danh sách thiết bị...
          </div>
        )}
        {isError && (
          <div className="notice notice--danger">
            Lỗi tải danh sách thiết bị!
          </div>
        )}
        <ul className="list">
          {filtered.map((d: any) => (
            <DeviceCard key={d.maThietBi} d={d} onEdit={onEdit} />
          ))}
        </ul>
      </div>
    </section>
  );
}
