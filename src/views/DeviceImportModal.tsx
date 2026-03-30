import React, { useEffect, useState } from "react";
import { DestinationInfo, SourceInfo } from "../types/import";

export interface ImportDraft {
  maThietBi: string;
  tenThietBi: string;
  maNhaCungCap?: string;
  tenNhaCungCap?: string;
  nguonID?: string;
  tenNguon?: string;
  dichID?: string;
  tenDich?: string;
  viDo?: string;
  kinhDo?: string;
  baseUrl?: string;
  mqttUrl?: string;
  authUrl?: string;
  registerUrl?: string;
  username?: string;
  password?: string;
}

export interface ProviderInfo {
  id: string;
  name: string;
  baseUrl: string;
  mqttUrl: string;
  authUrl?: string;
  registerUrl?: string;
  username: string;
  password: string;
}

interface ImportResult {
  success: number;
  errors: Array<{ line: string; error: string }>;
}

function useDeviceImportAdvanced(  sources: SourceInfo[], destinations: DestinationInfo[]) {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [editingDrafts, setEditingDrafts] = useState<ImportDraft[]>([]);
  const [availableSources, setAvailableSources] = useState<SourceInfo[]>([]);

  useEffect(() => {
    setAvailableSources(sources ?? []);
  }, [sources]);
  /* =======================
   * Parse input
   * ======================= */
// ✅ CẬP NHẬT HÀM parseLines
  const parseLines = (lines: string[]): ImportDraft[] => {
    const drafts: ImportDraft[] = [];

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 4) continue;

      const mac = parts[0];
      const nguonID = parts[1];

      // ✅ FIX: Loại bỏ dấu ; và trim whitespace
      const viDo = parts[2]?.replace(",", "").replace(";", "").trim();
      const kinhDo = parts[3]?.replace(";", "").trim();

      const tenThietBi = parts.slice(4).join(" ").trim();

      const source = sources.find(s => s.id === nguonID);

      const dichID =
        source?.dichID ??
        (nguonID.includes(".") ? nguonID.split(".")[0] : undefined);

      const destination = destinations.find(d => d.id === dichID);

      drafts.push({
        maThietBi: mac,
        tenThietBi: tenThietBi || `Thiết bị ${mac}`,

        nguonID,
        tenNguon: source?.name,

        dichID,
        tenDich: destination?.name,

        baseUrl: destination?.baseUrl,
        mqttUrl: destination?.mqttUrl,
        authUrl: destination?.authUrl,
        registerUrl: destination?.registerUrl,
        username: destination?.username,
        password: destination?.password,

        viDo,
        kinhDo,
      });
    }

    return drafts;
  };
  /* =======================
   * Public handlers
   * ======================= */
  const handleImport = (
    pastedText: string,
    onProceed: (drafts: ImportDraft[]) => void
  ) => {
    setImportResult(null);
    setEditingDrafts([]);

    if (!pastedText.trim()) {
      setImportResult({
        success: 0,
        errors: [{ line: "", error: "Vui lòng paste dữ liệu" }],
      });
      return;
    }

    const drafts = parseLines(
      pastedText
        .split(/\r?\n/)      // tách theo dòng
        .map(l => l.trim())
        .filter(Boolean)     // bỏ dòng trống
    );

    if (!drafts.length) return;

    setEditingDrafts(drafts);
    onProceed(drafts);
  };

  const updateDraft = (
    idx: number,
    key: keyof ImportDraft,
    value: string
  ) => {
    setEditingDrafts((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const applyProviderToAll = (
    providers: ProviderInfo[],
    providerId: string
  ) => {
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) return;

    setEditingDrafts((prev) =>
      prev.map((d) => ({
        ...d,
        maNhaCungCap: provider.id,
        tenNhaCungCap: provider.name,
      }))
    );
  };

  const addSourceAndApply = (source: SourceInfo) => {
    const destination = destinations.find(d => d.id === source.dichID);
    if (!destination) return;

    // 1️⃣ Lưu source vào availableSources
    setAvailableSources(prev =>
      prev.some(s => s.id === source.id) ? prev : [...prev, source]
    );

    // 2️⃣ APPLY CHO TẤT CẢ DRAFT CÙNG NGUONID
    setEditingDrafts(prev =>
      prev.map(d =>
        d.nguonID === source.id
          ? {
              ...d,
              tenNguon: source.name,
              dichID: destination.id,
              tenDich: destination.name,
              baseUrl: destination.baseUrl,
              mqttUrl: destination.mqttUrl,
              authUrl: destination.authUrl,
              registerUrl: destination.registerUrl,
              username: destination.username,
              password: destination.password,
            }
          : d
      )
    );
  };

  const clearProviderForAll = () => {
    setEditingDrafts((prev: any) =>
      prev.map((d: any) => ({
        ...d,
        maNhaCungCap: undefined,
        tenNhaCungCap: undefined,
      }))
    );
  };

  return {
    importResult,
    editingDrafts,
    handleImport,
    updateDraft,
    applyProviderToAll,
    addSourceAndApply,
    clearProviderForAll,
    availableSources,
    setImportResult,
  };
}

export function DeviceImportModal({
  isOpen,
  onClose,
  onImportSuccess,
  providers = [],
  sources = [],
  destinations = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (drafts: ImportDraft[]) => void;
  providers?: ProviderInfo[];
  sources?: SourceInfo[];
  destinations?: DestinationInfo[];
}) {
  const [pastedText, setPastedText] = useState("");
  const [step, setStep] = useState<"input" | "review">("input");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [addSourceForDraftIdx, setAddSourceForDraftIdx] = useState<number | null>(null);

  const {
    importResult,
    editingDrafts,
    handleImport,
    updateDraft,
    applyProviderToAll,
    addSourceAndApply,
    clearProviderForAll,
    setImportResult,
    availableSources,
  } = useDeviceImportAdvanced(sources, destinations);

  const handleImportClick = () => {
    handleImport(pastedText, () => {
      setStep("review");
    });
  };

  const handleConfirmClick = () => {
    if (editingDrafts.length === 0) {
      alert("Không có dữ liệu để import");
      return;
    }

    const invalid = editingDrafts.filter(
      (d) =>
        !d.maThietBi ||
        !d.tenThietBi ||
        !d.maNhaCungCap ||
        !d.tenNhaCungCap ||
        !d.nguonID ||
        !d.tenNguon ||
        !d.dichID ||
        !d.tenDich
    );

    if (invalid.length > 0) {
      alert(`${invalid.length} dòng chưa đủ dữ liệu bắt buộc`);
      return;
    }

    onImportSuccess(editingDrafts);
    handleClose();
  };

  const handleClose = () => {
    setPastedText("");
    setStep("input");
    setImportResult(null);
    setSelectedProvider("");
    onClose();
  };


  if (!isOpen) return null;

  return (
    <>
      <div style={styles.overlay}>
        <div style={{ ...styles.modal, maxHeight: "90vh", maxWidth: "1400px" }}>
          <div style={styles.header}>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
              Nhập nháp thiết bị
              {step === "review" && ` (${editingDrafts.length} dòng)`}
            </h2>
            <button
              onClick={handleClose}
              style={styles.closeBtn}
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          <div style={styles.content}>
            {step === "input" ? (
              <>
                <div style={styles.section}>
                  <h3
                    style={{ fontSize: "14px", fontWeight: "600", marginTop: 0 }}
                  >
                    Định dạng dữ liệu
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      marginBottom: "12px",
                    }}
                  >
                    Paste từng dòng:
                    <br />
                    <strong>MAC MADIABAN TOADODO TENTHIETBI</strong>
                  </p>
                  <details style={{ marginBottom: "16px" }}>
                    <summary
                      style={{
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                    >
                      📋 Ví dụ
                    </summary>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: "12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        margin: "8px 0 0 0",
                      }}
                    >
  {`24:d9:04:21:5c:09 H53.183 10.5633, 106.633908 Văn phòng Đảng Uỷ Xã Phước Vĩnh Tây`}
                    </pre>
                  </details>
                </div>

                <div style={styles.section}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "8px",
                    }}
                  >
                    Paste dữ liệu
                  </label>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste dữ liệu tại đây..."
                    style={styles.textarea}
                  />
                </div>

                {importResult && importResult.errors.length > 0 && (
                  <div
                    style={{
                      ...styles.section,
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "4px",
                      padding: "12px",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "14px",
                        color: "#991b1b",
                      }}
                    >
                      ⚠️ {importResult.errors.length} lỗi
                    </h4>
                    <ul
                      style={{
                        margin: "8px 0 0 0",
                        paddingLeft: "20px",
                        fontSize: "12px",
                      }}
                    >
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i} style={{ color: "#991b1b" }}>
                          {err.line && <strong>{err.line}:</strong>} {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <>
                <div
                  style={{
                    ...styles.section,
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-end",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        marginBottom: "4px",
                        display: "block",
                      }}
                    >
                      Chọn Nhà cung cấp cho tất cả:
                    </label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => {
                        const providerId = e.target.value;
                        setSelectedProvider(providerId);

                        if (providerId) {
                          applyProviderToAll(providers, providerId);
                        } else {
                          clearProviderForAll();
                        }
                      }}
                      style={{ ...styles.input, minWidth: "200px" }}
                    >
                      <option value="">-- Chọn --</option>
                      {providers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    (Có thể tùy chỉnh từng dòng)
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableHeader}>Mã Thiết Bị</th>
                        <th style={styles.tableHeader}>Tên Thiết Bị</th>
                        <th style={styles.tableHeader}>Mã NCC</th>
                        <th style={styles.tableHeader}>Tên NCC</th>
                        <th style={styles.tableHeader}>Nguồn ID</th>
                        <th style={styles.tableHeader}>Tên Nguồn</th>
                        <th style={styles.tableHeader}>Đích ID</th>
                        <th style={styles.tableHeader}>Tên Đích</th>
                        <th style={styles.tableHeader}>Vĩ Độ</th>
                        <th style={styles.tableHeader}>Kinh Độ</th>
                        <th style={styles.tableHeader}>BaseUrl</th>
                        <th style={styles.tableHeader}>MqttUrl</th>
                        <th style={styles.tableHeader}>AuthUrl</th>
                        <th style={styles.tableHeader}>RegisterUrl</th>
                        <th style={styles.tableHeader}>Username</th>
                        <th style={styles.tableHeader}>Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingDrafts.map((draft, idx) => {
                        const hasMissingRequired =
                          !draft.maThietBi ||
                          !draft.tenThietBi ||
                          !draft.maNhaCungCap ||
                          !draft.tenNhaCungCap ||
                          !draft.nguonID ||
                          !draft.tenNguon ||
                          !draft.dichID ||
                          !draft.tenDich;

                        return (
                          <tr
                            key={idx}
                            style={{
                              ...styles.tableRow,
                              background: hasMissingRequired
                                ? "#fef2f2"
                                : idx % 2 === 0
                                ? "#f9fafb"
                                : "white",
                            }}
                          >
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.maThietBi || ""}
                                style={styles.input}
                                disabled
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.tenThietBi || ""}
                                onChange={(e) =>
                                  updateDraft(idx, "tenThietBi", e.target.value)
                                }
                                style={{
                                  ...styles.input,
                                  borderColor: !draft.tenThietBi
                                    ? "#dc2626"
                                    : "#d1d5db",
                                }}
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <select
                                value={draft.maNhaCungCap || ""}
                                onChange={(e) => {
                                  const providerId = e.target.value;
                                  const provider = providers.find(
                                    (p) => p.id === providerId
                                  );
                                  updateDraft(idx, "maNhaCungCap", providerId);
                                  if (provider) {
                                    updateDraft(
                                      idx,
                                      "tenNhaCungCap",
                                      provider.name
                                    );
                                  }
                                }}
                                style={{
                                  ...styles.input,
                                  borderColor: !draft.maNhaCungCap
                                    ? "#dc2626"
                                    : "#d1d5db",
                                }}
                              >
                                <option value="">--</option>
                                {providers.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.id}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.tenNhaCungCap || ""}
                                style={styles.input}
                                disabled
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.nguonID || ""}
                                style={styles.input}
                                disabled
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.tenNguon || ""}
                                style={{
                                  ...styles.input,
                                  borderColor: !draft.tenNguon ? "#dc2626" : "#d1d5db",
                                }}
                                disabled
                              />
                              {!draft.tenNguon && (
                                <button
                                  onClick={() => {
                                    setAddSourceForDraftIdx(idx);
                                    setShowAddSourceModal(true);
                                  }}
                                  style={{
                                    ...styles.addSourceBtn,
                                    marginTop: "4px",
                                  }}
                                >
                                  + Thêm nguồn
                                </button>
                              )}
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.dichID || ""}
                                style={{
                                  ...styles.input,
                                  borderColor: !draft.dichID
                                    ? "#dc2626"
                                    : "#d1d5db",
                                }}
                                disabled
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.tenDich || ""}
                                style={{
                                  ...styles.input,
                                  borderColor: !draft.tenDich
                                    ? "#dc2626"
                                    : "#d1d5db",
                                }}
                                disabled
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.viDo || ""}
                                style={styles.input}
                                disabled
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.kinhDo || ""}
                                style={styles.input}
                                disabled
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.baseUrl || ""}
                                onChange={(e) =>
                                  updateDraft(idx, "baseUrl", e.target.value)
                                }
                                style={styles.input}
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.mqttUrl || ""}
                                onChange={(e) =>
                                  updateDraft(idx, "mqttUrl", e.target.value)
                                }
                                style={styles.input}
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.authUrl || ""}
                                onChange={(e) =>
                                  updateDraft(idx, "authUrl", e.target.value)
                                }
                                style={styles.input}
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.registerUrl || ""}
                                onChange={(e) =>
                                  updateDraft(idx, "registerUrl", e.target.value)
                                }
                                style={styles.input}
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.username || ""}
                                onChange={(e) =>
                                  updateDraft(idx, "username", e.target.value)
                                }
                                style={styles.input}
                              />
                            </td>
                            <td style={styles.tableCell}>
                              <input
                                type="text"
                                value={draft.password || ""}
                                onChange={(e) =>
                                  updateDraft(idx, "password", e.target.value)
                                }
                                style={styles.input}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div style={styles.footer}>
            <button onClick={handleClose} style={styles.btnSecondary}>
              {step === "input" ? "Đóng" : "Hủy"}
            </button>
            {step === "input" ? (
              <button
                onClick={handleImportClick}
                disabled={!pastedText.trim()}
                style={{
                  ...styles.btnPrimary,
                  opacity: !pastedText.trim() ? 0.6 : 1,
                  cursor: !pastedText.trim() ? "not-allowed" : "pointer",
                }}
              >
                Tiếp theo
              </button>
            ) : (
              <button onClick={handleConfirmClick} style={styles.btnPrimary}>
                Xác nhận nhập ({editingDrafts.length} dòng)
              </button>
            )}
          </div>
        </div>
      </div>

      {showAddSourceModal && addSourceForDraftIdx !== null && (
        <AddSourceModal
          draft={editingDrafts[addSourceForDraftIdx]}
          destinations={destinations}
          onClose={() => setShowAddSourceModal(false)}
          onConfirm={(newSource) => {
            addSourceAndApply(newSource);
            setShowAddSourceModal(false);
          }}
        />
      )}
    </>
  );

function AddSourceModal({
  draft,
  destinations,
  onClose,
  onConfirm,
}: {
  draft: ImportDraft;
  destinations: DestinationInfo[];
  onClose: () => void;
  onConfirm: (source: SourceInfo) => void;
}) {

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    dichID: "",
  });

  useEffect(() => {
    if (!draft) return;

    setFormData({
      id: draft.nguonID ?? "",          // ✅ ĐIỀN SẴN NGUỒN ID
      name: "",                         // ✏️ USER NHẬP
      dichID: draft.dichID ?? "",       // ✅ ĐIỀN SẴN ĐÍCH
    });
  }, [draft]);

  const handleChange = (key: keyof SourceInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    if (!formData.id || !formData.name || !formData.dichID) {
      alert("Vui lòng nhập Nguồn ID, Tên Nguồn và chọn Đích");
      return;
    }
    onConfirm(formData);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modal, maxWidth: "500px" }}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
            Thêm Nguồn Mới
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div style={styles.formContent}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nguồn ID *</label>
            <input
              type="text"
              value={formData.id}
              disabled
              style={styles.formInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tên Nguồn *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Xã Cần Giuộc"
              style={styles.formInput}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tên Đích *</label>
            <select value={formData.dichID} disabled style={{ ...styles.input, minWidth: "200px" }}>
              {destinations.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.btnSecondary}>
            Hủy
          </button>
          <button onClick={handleConfirm} style={styles.btnPrimary}>
            Thêm Nguồn
          </button>
        </div>
      </div>
    </div>
  );
}}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
    width: "95%",
    overflow: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6b7280",
    padding: 0,
  },
  content: {
    padding: "20px",
    maxHeight: "calc(90vh - 140px)",
    overflow: "auto",
  },
  section: {
    marginBottom: "16px",
  },
  textarea: {
    width: "100%",
    minHeight: "250px",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontFamily: "monospace",
    fontSize: "13px",
    resize: "vertical",
    boxSizing: "border-box",
  } as React.CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
  } as React.CSSProperties,
  tableHeaderRow: {
    background: "#f3f4f6",
  } as React.CSSProperties,
  tableHeader: {
    padding: "8px",
    textAlign: "left",
    fontWeight: "600",
    borderBottom: "2px solid #e5e7eb",
    minWidth: "90px",
  } as React.CSSProperties,
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
  } as React.CSSProperties,
  tableCell: {
    padding: "6px",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "5px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "12px",
    boxSizing: "border-box",
  } as React.CSSProperties,
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
  },
  btnSecondary: {
    padding: "8px 16px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  },
  btnPrimary: {
    padding: "8px 16px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  formContent: {
    padding: "20px",
    maxHeight: "calc(90vh - 140px)",
    overflow: "auto",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "6px",
    color: "#374151",
  },
  formInput: {
    width: "100%",
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "13px",
    boxSizing: "border-box",
  } as React.CSSProperties,
  addSourceBtn: {
    width: "100%",
    padding: "6px",
    background: "#f3f4f6",
    border: "1px dashed #d1d5db",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    color: "#3b82f6",
    fontWeight: "500",
  } as React.CSSProperties,
};
