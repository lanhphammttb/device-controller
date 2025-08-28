import React from "react";
import { FiEdit } from "react-icons/fi";
import Badge from "../ui/Badge";

export function DeviceCard({
  d,
  onEdit,
}: {
  d: any;
  onEdit: (d: any) => void;
}) {
  return (
    <li
      className={[
        "list__item",
        "card",
        "card--hover",
        d.ketNoi ? "card--on" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      key={d.maThietBi}
    >
      <div className="list__meta">
        <div className="list__title">{d.tenThietBi || ""}</div>
        <div className="list__subtitle">
          <span className="mono">{d.maThietBi || "—"}</span> •{" "}
          {d.maNhaCungCap || "—"} •{" "}
          <Badge tone={d.ketNoi ? "success" : "danger"}>
            {d.ketNoi ? "ON" : "OFF"}
          </Badge>
        </div>
      </div>

      <button
        className="icon-btn"
        onClick={() => onEdit(d)}
        aria-label="Chỉnh sửa"
        title="Chỉnh sửa"
      >
        <FiEdit size={18} />
      </button>
    </li>
  );
}
