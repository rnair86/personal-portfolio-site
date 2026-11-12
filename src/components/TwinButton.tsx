"use client";

import type { ReactNode } from "react";
import { OPEN_TWIN_EVENT } from "./DigitalTwin";

export function TwinButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_TWIN_EVENT))}
    >
      {children}
    </button>
  );
}
