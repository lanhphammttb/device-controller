import React, { useEffect, useState } from "react";
import TopBar from "../components/layout/TopBar";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Device } from "../types/device";
import { getToken } from "../services/authToken";
import { updateConnectDevice } from "../services/authService";

export default function DeviceConfigView({
  device,
  onBack,
  onSave,
  onLogout,
  saving,
  saveMsg,
}: {
  device: Device;
  onBack: () => void;
  onSave: (d: Device) => void;
  onLogout: () => void;
  saving?: boolean;
  saveMsg?: string | null;
}) {
  const [form, setForm] = useState<Device>(device);
  const [msg, setMsg] = useState("");

  useEffect(() => setForm(device), [device]);
  const update = <K extends keyof Device>(k: K, v: Device[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function handleKetNoi(v: boolean) {
    const t = getToken();
    if (t && form.maThietBi) {
      await updateConnectDevice(form.maThietBi, v, t);
      setForm((p) => ({ ...p, ketNoi: v }));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.tenThietBi || !form.maThietBi) {
      setMsg("Vui lòng nhập Tên thiết bị và Mã thiết bị.");
      return;
    }
    onSave(form);
    setMsg("Đã lưu cấu hình.");
  }

  return (
    <section className="view">
      <TopBar
        title={`Cấu hình: ${
          device.tenThietBi || device.maThietBi || "Thiết bị"
        }`}
        right={
          <Button variant="ghost" onClick={onLogout}>
            Đăng xuất
          </Button>
        }
      />
      <div className="content">
        {saving && <div className="notice notice--info">Đang lưu...</div>}
        {saveMsg && (
          <div
            className={[
              "notice",
              !saveMsg.includes("Không") ? "notice--success" : "notice--danger",
            ].join(" ")}
          >
            {saveMsg}
          </div>
        )}

        <form className="form card card--padded" onSubmit={submit}>
          <div className="grid grid--2">
            {[
              ["tenThietBi", "Tên thiết bị"],
              ["maThietBi", "Mã thiết bị"],
              ["baseUrl", "BaseUrl"],
              ["mqttUrl", "MqttUrl"],
              ["username", "Username"],
              ["password", "Password"],
              ["maNhaCungCap", "Mã nhà cung cấp"],
              ["tenNhaCungCap", "Tên nhà cung cấp"],
              ["nguonID", "Nguồn ID"],
              ["tenNguon", "Tên nguồn"],
              ["dichID", "Đích ID"],
              ["tenDich", "Tên đích"],
            ].map(([key, label]) => (
              <div className="form__row" key={key}>
                <label className="form__label" htmlFor={key}>
                  {label}
                </label>
                <input
                  id={key}
                  className="input"
                  type={key === "password" ? "password" : "text"}
                  value={(form as any)[key] ?? ""}
                  onChange={(e) => update(key as any, e.target.value)}
                />
              </div>
            ))}
            <div className="form__row">
              <label className="form__label" htmlFor="kinhDo">
                Kinh độ
              </label>
              <input
                id="kinhDo"
                className="input"
                type="text"
                value={form.kinhDo ?? ""}
                onChange={(e) => update("kinhDo", e.target.value || null)}
              />
            </div>
            <div className="form__row">
              <label className="form__label" htmlFor="viDo">
                Vĩ độ
              </label>
              <input
                id="viDo"
                className="input"
                type="text"
                value={form.viDo ?? ""}
                onChange={(e) => update("viDo", e.target.value || null)}
              />
            </div>
          </div>

          <div className="form__row form__row--inline">
            <label className="form__label">Trạng thái</label>
            <div className="button-group">
              <Button
                variant={form.ketNoi ? "primary" : "ghost"}
                type="button"
                onClick={() => handleKetNoi(true)}
                disabled={form.ketNoi}
              >
                Bật
              </Button>
              <Button
                variant={!form.ketNoi ? "primary" : "ghost"}
                type="button"
                onClick={() => handleKetNoi(false)}
                disabled={!form.ketNoi}
              >
                Tắt
              </Button>
              <Badge tone={form.ketNoi ? "success" : "danger"}>
                {form.ketNoi ? "ON" : "OFF"}
              </Badge>
            </div>
          </div>

          <div className="form__row form__row--actions">
            <Button type="button" onClick={onBack}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Lưu cấu hình
            </Button>
          </div>
          <p className="hint" aria-live="polite">
            {msg}
          </p>
        </form>
      </div>
    </section>
  );
}
