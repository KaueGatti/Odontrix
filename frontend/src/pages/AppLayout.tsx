import { Sidebar } from "@/components/layout/Sidebar";
import {Outlet} from "react-router";

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet/>
      </main>
    </div>
  );
}
