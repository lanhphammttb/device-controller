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
  q,
  setQ,
  provider,
  setProvider,
  source,
  setSource,
  layoutMode,
  setLayoutMode,
  selectedDeviceId,
  activeTab,
  setActiveTab,
}: {
  data?: any[];
  isLoading: boolean;
  isError: boolean;
  onLogout: () => void;
  onEdit: (d: any) => void;
  q: string;
  setQ: (q: string) => void;
  provider: string;
  setProvider: (provider: string) => void;
  source: string;
  setSource: (source: string) => void;
  layoutMode: "horizontal" | "columns";
  setLayoutMode: (mode: "horizontal" | "columns") => void;
  selectedDeviceId: string | null;
  activeTab: "known" | "unknown";
  setActiveTab: (tab: "known" | "unknown") => void;
}) {
  const user = getUserClaims();

  const providers = useMemo(() => {
    const set = new Set<string>();
    (data || []).forEach((d: any) => {
      if (d.maNhaCungCap) set.add(String(d.maNhaCungCap));
    });
    return ["", ...Array.from(set)];
  }, [data]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    (data || []).forEach((d: any) => {
      if (d.tenNguon) set.add(String(d.tenNguon));
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
      const matchSource = !source || String(d.tenNguon || "") === source;
      const notStringName =
        String(d.tenThietBi || "").toLowerCase() !== "string";
      const isKnownProvider = d.maNhaCungCap && d.maNhaCungCap.trim() !== "";
      const matchTab =
        layoutMode === "horizontal"
          ? true
          : activeTab === "known"
          ? isKnownProvider
          : !isKnownProvider;
      return (
        matchText && matchProvider && matchSource && notStringName && matchTab
      );
    });
  }, [data, q, provider, source, activeTab, layoutMode]);

  const groupedData = useMemo(() => {
    const groups: { [provider: string]: { [source: string]: any[] } } = {};

    filtered.forEach((d: any) => {
      const providerKey = d.maNhaCungCap || "Không xác định";
      const sourceKey = d.tenNguon || "Không xác định";

      if (!groups[providerKey]) {
        groups[providerKey] = {};
      }
      if (!groups[providerKey][sourceKey]) {
        groups[providerKey][sourceKey] = [];
      }
      groups[providerKey][sourceKey].push(d);
    });

    return groups;
  }, [filtered]);

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                Bộ lọc và tìm kiếm
              </h3>
              {!isLoading && !isError && (
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  Hiển thị {filtered.length}/{data?.length || 0} thiết bị
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                className={`btn ${
                  layoutMode === "horizontal" ? "btn--primary" : "btn--ghost"
                }`}
                onClick={() => setLayoutMode("horizontal")}
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                Ngang
              </button>
              <button
                className={`btn ${
                  layoutMode === "columns" ? "btn--primary" : "btn--ghost"
                }`}
                onClick={() => setLayoutMode("columns")}
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                Cột
              </button>
              {layoutMode === "columns" && (
                <>
                  <div
                    style={{
                      width: "1px",
                      backgroundColor: "#e5e7eb",
                      margin: "0 4px",
                    }}
                  ></div>
                  <button
                    className={`btn ${
                      activeTab === "known" ? "btn--primary" : "btn--ghost"
                    }`}
                    onClick={() => setActiveTab("known")}
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    Đã có
                  </button>
                  <button
                    className={`btn ${
                      activeTab === "unknown" ? "btn--primary" : "btn--ghost"
                    }`}
                    onClick={() => setActiveTab("unknown")}
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    Không xác định
                  </button>
                </>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "end",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1", minWidth: "200px" }}>
              <label
                className="form__label"
                htmlFor="search"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Tìm kiếm
              </label>
              <input
                id="search"
                className="input"
                placeholder="Mã/Tên thiết bị..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ minWidth: "150px" }}>
              <label
                className="form__label"
                htmlFor="provider"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Nhà cung cấp
              </label>
              <select
                id="provider"
                className="input"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                style={{ width: "100%" }}
              >
                {providers.map((p) => (
                  <option key={p || "all"} value={p}>
                    {p ? p : "Tất cả"}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ minWidth: "150px" }}>
              <label
                className="form__label"
                htmlFor="source"
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Tên nguồn
              </label>
              <select
                id="source"
                className="input"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={{ width: "100%" }}
              >
                {sources.map((s) => (
                  <option key={s || "all"} value={s}>
                    {s ? s : "Tất cả"}
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

        {layoutMode === "horizontal" ? (
          <ul className="list">
            {filtered.map((d: any) => (
              <DeviceCard
                key={d.maThietBi}
                d={d}
                onEdit={onEdit}
                isSelected={selectedDeviceId === d.maThietBi}
              />
            ))}
          </ul>
        ) : (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {Object.entries(groupedData).map(([providerKey, sources]) => (
              <div key={providerKey} style={{ flex: "1", minWidth: "300px" }}>
                <div className="card" style={{ marginBottom: "16px" }}>
                  <div
                    className="card__header"
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      {providerKey}
                    </h4>
                  </div>
                  <div style={{ padding: "16px" }}>
                    {Object.entries(sources).map(([sourceKey, devices]) => (
                      <div key={sourceKey} style={{ marginBottom: "20px" }}>
                        <h5
                          style={{
                            margin: "0 0 12px 0",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#6b7280",
                            paddingBottom: "8px",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          {sourceKey}
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#9ca3af",
                              backgroundColor: "#f3f4f6",
                              padding: "2px 6px",
                              borderRadius: "10px",
                              marginLeft: "8px",
                            }}
                          >
                            {devices.length}
                          </span>
                        </h5>
                        <ul className="list" style={{ margin: 0 }}>
                          {devices.map((d: any) => (
                            <DeviceCard
                              key={d.maThietBi}
                              d={d}
                              onEdit={onEdit}
                              isSelected={selectedDeviceId === d.maThietBi}
                            />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
