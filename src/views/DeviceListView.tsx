import React, { useEffect, useMemo, useState } from "react";
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
  providerSourceTabs,
  setProviderSourceTabs,
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
  providerSourceTabs: Record<string, string>;
  setProviderSourceTabs: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}) {
  // providerSourceTabs state is managed by App and persisted there
  const user = getUserClaims();

  const providers = useMemo(() => {
    const set = new Set<string>();
    (data || []).forEach((d: any) => {
      if (d.maNhaCungCap) set.add(String(d.maNhaCungCap));
    });
    return ["", ...Array.from(set)];
  }, [data]);

  const sourcesForProvider = useMemo(() => {
    const set = new Set<string>();
    (data || []).forEach((d: any) => {
      const providerMatch =
        !provider || String(d.maNhaCungCap || "") === provider;
      if (providerMatch && d.tenNguon) set.add(String(d.tenNguon));
    });
    return ["", ...Array.from(set)];
  }, [data, provider]);

  // Ensure current source remains valid for selected provider
  useEffect(() => {
    if (source && !sourcesForProvider.includes(source)) {
      setSource("");
    }
  }, [provider, sourcesForProvider]);

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
    // Provider -> Source (tenNguon) -> Commune (tenDich) -> Devices
    const groups: {
      [provider: string]: { [source: string]: { [commune: string]: any[] } };
    } = {};

    filtered.forEach((d: any) => {
      const providerKey = String(d.maNhaCungCap || "Không xác định").trim();
      const sourceKey = String(d.tenNguon || "Không xác định").trim();
      const communeKey = d.tenDich || "Không xác định";

      if (!groups[providerKey]) {
        groups[providerKey] = {};
      }
      if (!groups[providerKey][sourceKey]) {
        groups[providerKey][sourceKey] = {};
      }
      if (!groups[providerKey][sourceKey][communeKey]) {
        groups[providerKey][sourceKey][communeKey] = [];
      }
      groups[providerKey][sourceKey][communeKey].push(d);
    });

    return groups;
  }, [filtered]);

  const totalCount = data?.length || 0;
  const filteredCount = filtered.length;
  return (
    <section className="view">
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
              <Button
                className="btn--ghost"
                onClick={onLogout}
                title={user?.name || user?.id || user?.email || "Đăng xuất"}
                aria-label="Đăng xuất"
                style={{ padding: "6px 8px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  focusable="false"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
              </Button>
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
                {sourcesForProvider.map((s) => (
                  <option key={s || "all"} value={s}>
                    {s ? s : "Tất cả"}
                  </option>
                ))}
              </select>
            </div>
            {layoutMode === "columns" && provider === "" && source === "" && (
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
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
              </div>
            )}
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
            {Object.entries(groupedData).map(
              ([providerKey, sourcesByProvider]) => (
                <div key={providerKey} style={{ flex: "1", minWidth: "300px" }}>
                  <div className="card" style={{ marginBottom: "16px" }}>
                    {/* Compact header: provider + source tabs on one line */}
                    <div
                      style={{
                        padding: "10px 16px 16px 16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <h4
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#374151",
                          }}
                        >
                          {providerKey}
                        </h4>
                        <div
                          style={{
                            width: 1,
                            height: 16,
                            background: "#e5e7eb",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            flexWrap: "wrap",
                          }}
                        >
                          {(() => {
                            const available = Object.keys(
                              sourcesByProvider
                            ).map((k) => String(k).trim());
                            const saved = providerSourceTabs[providerKey];
                            const selectedSourceForProvider =
                              available.includes(saved) ? saved : available[0];
                            return available.map((sourceKey) => {
                              const sourceCount = Object.values(
                                sourcesByProvider[sourceKey] || {}
                              ).reduce(
                                (sum, arr: any) => sum + (arr as any[]).length,
                                0
                              );
                              const isActive =
                                selectedSourceForProvider === sourceKey;
                              return (
                                <button
                                  key={sourceKey}
                                  className={`btn ${
                                    isActive ? "btn--primary" : "btn--ghost"
                                  }`}
                                  onClick={() =>
                                    setProviderSourceTabs((prev) => ({
                                      ...prev,
                                      [providerKey]: sourceKey,
                                    }))
                                  }
                                  style={{
                                    fontSize: "11px",
                                    padding: "4px 8px",
                                  }}
                                >
                                  {sourceKey}
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: "11px",
                                      color: "#6b7280",
                                      backgroundColor: "#f3f4f6",
                                      padding: "1px 5px",
                                      borderRadius: 10,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {sourceCount}
                                  </span>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: "0 16px 16px 16px" }}>
                      {(() => {
                        const available = Object.keys(sourcesByProvider).map(
                          (k) => String(k).trim()
                        );
                        const saved = providerSourceTabs[providerKey];
                        const selectedSource = available.includes(saved)
                          ? saved
                          : available[0];
                        return Object.entries(sourcesByProvider).map(
                          ([rawSourceKey, communes]) => {
                            const sourceKey = String(rawSourceKey).trim();
                            if (sourceKey !== selectedSource) return null;

                            const allDevices = Object.values(
                              communes
                            ).flat() as any[];
                            return (
                              <ul
                                key={sourceKey}
                                className="list"
                                style={{ margin: 0 }}
                              >
                                {allDevices.map((d: any) => (
                                  <DeviceCard
                                    key={d.maThietBi}
                                    d={d}
                                    onEdit={onEdit}
                                    isSelected={
                                      selectedDeviceId === d.maThietBi
                                    }
                                  />
                                ))}
                              </ul>
                            );
                          }
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
