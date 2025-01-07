import { PropsWithChildren } from "react";
import "../styles/blink.css";

export function Blink({ children }: PropsWithChildren) {
  return <span className="blink">{children}</span>;
}
