import type { ReactNode } from "react";
import AppNavbar from "../components/Navbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <div className="flex-grow-1">{children}</div>
    </div>
  );
}
