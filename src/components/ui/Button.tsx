import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost";
};
export default function Button({
  className,
  variant = "default",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={[
        "btn",
        variant === "primary" ? "btn--primary" : "",
        variant === "ghost" ? "btn--ghost" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
