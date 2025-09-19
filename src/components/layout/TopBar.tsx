import React from "react";
export default function TopBar({
  title,
  right,
  overlayRight = false,
}: {
  title: string;
  right?: React.ReactNode;
  overlayRight?: boolean;
}) {
  return (
    <header className="topbar">
      <h2 className="topbar__title">{title}</h2>
      <div
        className={[
          "topbar__actions",
          overlayRight ? "topbar__actions--overlay" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {right}
      </div>
    </header>
  );
}
