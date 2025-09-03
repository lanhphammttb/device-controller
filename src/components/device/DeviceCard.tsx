import React from "react";
import Badge from "../ui/Badge";

export function DeviceCard({
  d,
  onEdit,
}: {
  d: any;
  onEdit: (d: any) => void;
}) {
  const formatDateTime = (s?: string) => {
    if (!s) return "—";
    const dt = new Date(s);
    if (isNaN(dt.getTime())) return s;
    const d = dt.getDate();
    const m = dt.getMonth() + 1;
    const yy = String(dt.getFullYear() % 100).padStart(2, "0");
    const h = dt.getHours();
    const min = dt.getMinutes();
    const sec = dt.getSeconds();
    return `${h}:${min}:${sec} ${d}/${m}/${yy}`;
  };
  return (
    <li
      className={["list__item", "card", "card--hover"]
        .filter(Boolean)
        .join(" ")}
      data-status={d.ketNoi ? "on" : "off"}
      key={d.maThietBi}
    >
      <div className="list__meta">
        <div className="list__title">{d.tenThietBi || ""}</div>
        <div className="list__subtitle">
          <span className="mono">{d.maThietBi || "—"}</span>{" "}
          <span className="list__subtitle-faded">
            • {d.maNhaCungCap || "—"}
          </span>
        </div>
      </div>

      <Badge tone={d.ketNoi ? "success" : "danger"}>
        {d.ketNoi ? "ON" : "OFF"}
      </Badge>

      <button
        className="icon-btn"
        onClick={() => onEdit(d)}
        aria-label="Chỉnh sửa"
        title="Chỉnh sửa"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ color: "#5d5f60ff" }}
        >
          <path
            fill="currentColor"
            d="M14.69 3.16a2.5 2.5 0 0 1 3.54 0l2.61 2.61a2.5 2.5 0 0 1 0 3.54L9.4 20.35a2 2 0 0 1-.9.52l-4.46 1.15a.75.75 0 0 1-.91-.91l1.15-4.46a2 2 0 0 1 .52-.9L14.69 3.16Zm2.83 1.41a1 1 0 0 0-1.41 0l-1.48 1.48 2.83 2.83 1.48-1.48a1 1 0 0 0 0-1.41l-1.42-1.42ZM13.31 7.07 5.8 14.59a.5.5 0 0 0-.13.22l-.95 3.7 3.7-.95a.5.5 0 0 0 .22-.13l7.52-7.52-2.83-2.83Z"
          />
        </svg>
      </button>

      {/* subtle timestamp at bottom-right, offset from the badge */}
      <span
        className="card__timestamp"
        title={d.ngayKhoiTao || ""}
        aria-label="Thời gian khởi tạo"
      >
        {formatDateTime(d.ngayKhoiTao)}
      </span>
    </li>
  );
}
