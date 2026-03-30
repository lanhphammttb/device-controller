import React, { useEffect, useRef, useState } from "react";
import TopBar from "../components/layout/TopBar";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Device, DeviceDraft } from "../types/device";
import { getToken } from "../services/authToken";
import { updateConnectDevice } from "../services/authService";
import { useDrafts } from "../hooks/useDrafts";

export default function DeviceConfigView({
  device,
  onBack,
  onSave,
  onLogout,
  saving,
  saveMsg,
}: {
  device: DeviceDraft;
  onBack: () => void;
  onSave: (d: DeviceDraft) => void;
  onLogout: () => void;
  saving?: boolean;
  saveMsg?: string | null;
}) {
  const [form, setForm] = useState<DeviceDraft>(device);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const prevDeviceIdRef = useRef<string>("");
  const [isFirstRender, setIsFirstRender] = useState(true);

  const { updateDraft } = useDrafts();

    // ✅ FIX: Only reset when DIFFERENT device is opened
  useEffect(() => {
    if (prevDeviceIdRef.current === device.maThietBi && !isFirstRender) {
      return;
    }

    // New device opened → reset form
    setForm({
      ...device,
      __draft: device.__draft ?? false,  // ← Giữ nguyên nếu có
    });
    setErrors({});
    setMsg("");

    prevDeviceIdRef.current = device.maThietBi;
    setIsFirstRender(false);
  }, [device]);

  useEffect(() => {
    if (!form.maThietBi) return;

    const timer = setInterval(() => {
      updateDraft(form.maThietBi, form);
    }, 30000);

    return () => clearInterval(timer);
  }, [form, updateDraft]);

  const update = <K extends keyof Device>(k: K, v: Device[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function handleKetNoi(v: boolean) {
    const t = getToken();
    if (!t || !form.maThietBi) return;

    try {
      await updateConnectDevice(form.maThietBi, v, t);
      setForm((p) => ({ ...p, ketNoi: v }));

      // ✅ Update draft as well
      updateDraft(form.maThietBi, { ketNoi: v });
    } catch (error) {
      console.error("Failed to update connection status", error);
      setMsg("Cập nhật trạng thái thất bại!");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const requiredKeys = [
      "tenThietBi",
      "maThietBi",
      "baseUrl",
      "mqttUrl",
      "authUrl",
      "registerUrl",
      "username",
      "password",
      "maNhaCungCap",
      "tenNhaCungCap",
      "nguonID",
      "tenNguon",
      "dichID",
      "tenDich",
    ] as const;

    const labels: Record<string, string> = {
      tenThietBi: "Tên thiết bị",
      maThietBi: "Mã thiết bị",
      baseUrl: "BaseUrl",
      mqttUrl: "MqttUrl",
      authUrl: "AuthUrl",
      registerUrl: "RegisterUrl",
      username: "Username",
      password: "Password",
      maNhaCungCap: "Mã nhà cung cấp",
      tenNhaCungCap: "Tên nhà cung cấp",
      nguonID: "Nguồn ID",
      tenNguon: "Tên nguồn",
      dichID: "Đích ID",
      tenDich: "Tên đích",
    };

    const newErrors: Record<string, string> = {};
    for (const k of requiredKeys) {
      const v = (form as any)[k];
      if (v === undefined || v === null || String(v).trim() === "") {
        newErrors[k] = `Vui lòng nhập ${labels[k]}.`;
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setMsg("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    setMsg("");
    onSave(form);
  }


  return (
    <section className="view">
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
              ["authUrl", "AuthUrl"],
              ["registerUrl", "RegisterUrl"],
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
                  className={`input ${
                    errors[key as string] ? "input--error" : ""
                  }`}
                  type={key === "password" ? "password" : "text"}
                  value={(form as any)[key] ?? ""}
                  onChange={(e) => {
                    update(key as any, e.target.value);
                    if (errors[key as string]) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next[key as string];
                        return next;
                      });
                    }
                  }}
                />
                {errors[key as string] && (
                  <div className="error-text">{errors[key as string]}</div>
                )}
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
