import React from "react";
export default function Badge({
  tone = "neutral",
  children,
}: {
  children: React.ReactNode;
  tone?: "success" | "danger" | "neutral";
}) {
  return (
    <span className={["badge", `badge--${tone}`].join(" ")}>{children}</span>
  );
}
