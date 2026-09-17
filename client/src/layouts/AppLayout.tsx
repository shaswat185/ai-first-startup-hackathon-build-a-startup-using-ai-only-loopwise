import type { ReactNode } from "react";
import { Container } from "react-bootstrap";
import AppNavbar from "../components/Navbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <Container className="flex-grow-1 py-4">{children}</Container>
    </div>
  );
}
