import React from "react";
export default function TopBar({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="topbar">
      <h2 className="topbar__title">{title}</h2>
      <div className="topbar__actions">{right}</div>
    </header>
  );
}
