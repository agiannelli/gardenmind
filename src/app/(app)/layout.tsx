import { Nav } from "@/components/layout/Nav";
import { Sidebar } from "@/components/layout/Sidebar";
import { BedsProvider } from "@/contexts/BedsContext";
import { GardensProvider } from "@/contexts/GardensContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BedsProvider>
      <GardensProvider>
        <div className="flex flex-col h-screen overflow-hidden">
          <Nav />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-cream p-7">{children}</main>
          </div>
        </div>
      </GardensProvider>
    </BedsProvider>
  );
}
